import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";

// Helper interface to fix TS error
interface AuthRequest extends Request {
    userId?: string;
}

export const getUserCredits = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        res.json({ credits: user?.credits });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

export const createUserProject = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    try {
        const { initial_prompt } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user && user.credits < 5) {
            return res.status(403).json({ message: 'Add credits to create more projects' })
        }

        // FIXED: Correctly slice the string for the name
        const projectName = initial_prompt.length > 50 
            ? initial_prompt.slice(0, 47) + '...' 
            : initial_prompt;

        const project = await prisma.websiteProject.create({
            data: {
                name: projectName,
                initial_prompt,
                userId
            }
        });

        // Update user's Total Creation 
        await prisma.user.update({
            where: { id: userId },
            data: { totalCreation: { increment: 1 } }
        });

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        });

        // Enhance user prompt
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: "kwaipilot/kat-coder-pro:free",
            messages: [{
                role: 'system',
                content: `You are a prompt enhancement specialist. Return ONLY the enhanced prompt.`
            }, {
                role: 'user',
                content: initial_prompt
            }]
        });

        const enhancedPrompt = promptEnhanceResponse.choices[0]?.message?.content || initial_prompt;

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
                projectId: project.id
            }
        });

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `Now generating your website...`,
                projectId: project.id
            }
        });

        // Generate website code
        const codeGenerationResponse = await openai.chat.completions.create({
            model: "kwaipilot/kat-coder-pro:free",
            messages: [{
                role: 'system',
                content: `You are an expert web developer. 
                CRITICAL REQUIREMENTS:
                - Return ONLY the complete updated HTML code.
                - Use Tailwind CSS for ALL styling.
                - Include <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`
            }, {
                role: 'user',
                content: enhancedPrompt || ''
            }]
        });

        const code = codeGenerationResponse.choices[0]?.message?.content || '';

        if (!code) {
            await prisma.conversation.create({
                data: {
                    role: 'assistant',
                    content: "Unable to generate the code, please try again",
                    projectId: project.id
                }
            });
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            });
            return res.status(500).json({ message: "Failed to generate code" });
        }

        const cleanCode = code.replace(/```[a-z]*\n?/gi, '').replace(/```$/g, '').trim();

        const version = await prisma.version.create({
            data: {
                code: cleanCode,
                description: 'Initial version',
                projectId: project.id
            }
        });

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I've created your website! You can now preview it and request any changes",
                projectId: project.id
            }
        });

        await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
                current_code: cleanCode,
                current_version_index: version.id
            }
        });

        res.json({ projectId: project.id });

    } catch (error: any) {
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: 5 } }
            });
        }
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

export const getUserProject = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        
        const { projectId } = req.params;

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: {
                conversation: { orderBy: { timestamp: 'asc' } },
                versions: { orderBy: { timestamp: 'asc' } }
            }
        });

        res.json({ project });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

export const getUserProjects = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });

        res.json({ projects });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

export const togglePublish = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { projectId } = req.params;
        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: { isPublished: !project.isPublished }
        });

        res.json({ message: project.isPublished ? 'Project Unpublished' : 'Project Published Successfully' });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}

export const purchaseCredits = async (req: Request, res: Response) => {
    // Placeholder for future implementation
    res.json({ message: "Purchase endpoint not implemented yet" });
}