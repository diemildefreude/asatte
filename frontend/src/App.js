import './App.css';
import { AuthProvider } from './contexts/AuthContext'; // Your AuthContext provider
import './services/api'; // <--- THIS LINE IS CRUCIAL
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Post from './components/pages/Post';
import Login from './components/pages/Login';
import Registration from './components/pages/Registration';
import PasswordChange from './components/pages/PasswordChange';
import PasswordRecovery from './components/pages/PasswordRecovery';
import OAuthCallback from './components/pages/OAuthCallback';
import './styles/reset.css';
import './styles/styles.css';
import UserProfile from './components/pages/UserProfile';
import Dashboard from './components/pages/Dashboard';
import NewPost from './components/pages/dashboard/NewPost';
import Posts from './components/pages/dashboard/Posts';
import EditPost from './components/pages/dashboard/EditPost';
import Activity from './components/pages/dashboard/Activity';
import Mail from './components/pages/dashboard/Mail';
import PasswordReset from './components/pages/PasswordReset';
import NotFound from './components/pages/NotFound';

function App() 
{
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/dashboard/new-post" element={<NewPost />}/>
          <Route path="/dashboard/edit-post/:post_url" element={<EditPost />}/>
          <Route path="/dashboard/posts" element={<Posts />}/>
          <Route path="/dashboard/activity" element={<Activity />}/>
          <Route path="/dashboard/mail" element={<Mail />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Registration />}/>
          <Route path="/password-change" element={<PasswordChange />}/>
          <Route path="/password-recovery" element={<PasswordRecovery />}/>
          <Route path="/password-reset" element={<PasswordReset />}/>
          <Route path="/oauth-callback" element={<OAuthCallback />}/>
          <Route path="/:username/:post_url" element={<Post />}/>
          <Route path="/:username" element={<UserProfile />}/>
          <Route path="/not-found" element={<NotFound />} />          
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
      
  );
}

export default App;
