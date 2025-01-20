import { Link } from "react-router";

const Header = () => {
    return (
      <header className="bg-blue-500 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mind Map Creator</h1>
          <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <ul className="flex gap-4">
            <li>
               <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>

            </li>
            <li>
              <Link to="/create" className="text-gray-600 hover:text-gray-900">Create</Link>
            
            </li>
            <li>
                <Link to="/view" className="text-gray-600 hover:text-gray-900">View Maps</Link>
            </li>
          </ul>
        </div>
      </nav>
        </div>
      </header>
    );
  };
  
  export default Header;