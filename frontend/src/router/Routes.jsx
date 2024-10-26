import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../Pages/Home'
import LoginPage from '../Pages/Login';
import MainDashboard from '../Pages/MainDashboard';
import PrivateRoute from './PrivateRoute';
import SingleInterview from '../Pages/SingleInterview';
import InterviewPage from '../Pages/InterviewPage';

function AllRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/dashboard' element={
                // <PrivateRoute>
                <MainDashboard />
                // </PrivateRoute>
            } />
            <Route path='/dashboard/:id' element={<SingleInterview />} />
            <Route path='/interviews' element={<MainDashboard />} />
            <Route path='/interview/:id' element={<InterviewPage />} />
            <Route path='*' element={<Home />} />
        </Routes>
    )
}

export default AllRoutes;