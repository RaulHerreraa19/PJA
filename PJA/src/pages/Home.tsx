import { useNavigate } from 'react-router-dom';
function Home() {
    const navigate = useNavigate();
    const goToLogin = () => {
        navigate('/login');
    };
    return (
        <>
            <div>Home Page</div>
            <button onClick={goToLogin}>Go to Login</button>
        </> 
    )
}

export default Home;