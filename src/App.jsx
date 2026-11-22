import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Home from './pages/Home'
import TracksPage from './pages/TracksPage'
import TopicPage from './pages/TopicPage'
import CodeClinicPage from './pages/CodeClinicPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tracks" element={<TracksPage />} />
          <Route path="/tracks/:trackId/:topicId" element={<TopicPage />} />
          <Route path="/clinic" element={<CodeClinicPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
