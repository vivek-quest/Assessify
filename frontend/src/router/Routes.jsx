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
                <PrivateRoute>
                    <MainDashboard />
                </PrivateRoute>
            } />
            <Route path='/dashboard/:id' element={
                <PrivateRoute>
                    <SingleInterview />
                </PrivateRoute>
            } />
            <Route path='/interviews' element={
                <PrivateRoute>
                    <MainDashboard />
                </PrivateRoute>
            } />
            <Route path='/interview/:id' element={
                <PrivateRoute>
                    <InterviewPage />
                </PrivateRoute>
            } />
            <Route path='*' element={<Home />} />
        </Routes>
    )
}

export default AllRoutes;