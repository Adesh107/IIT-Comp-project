import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Pricing from './pages/Pricing'
import Projects from './pages/Projects'
import Myproject from './pages/myproject'
import Preview from './pages/preview'

import Community from './pages/Community'
import View from './pages/View'
import Navbar from './components/Navbar'
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/pricing' element={<Pricing />} />
        <Route path='/projects/:projectId' element={<Projects />} />
        <Route path='/projects' element={<Myproject />} />
        <Route path='/preview/:projectId' element ={<Preview />} />
        <Route path='/preview/:projectId/:versionId' element={<Preview />}/>
        <Route path='/community' element={<Community />} />
        <Route path='/view/:projectId' element={<View />} />
      </Routes>
    </div>
  )
}

export default App