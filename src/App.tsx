import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/routes/Dashboard'
import History from '@/routes/History'
import Photo from '@/routes/Photo'
import Planner from '@/routes/Planner'
import Workouts from '@/routes/Workouts'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="workouts" element={<Workouts />} />
        <Route path="photo" element={<Photo />} />
        <Route path="history" element={<History />} />
        <Route path="planner" element={<Planner />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
