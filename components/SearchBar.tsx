import { Search } from 'lucide-react';

const SearchBar: React.FC<{
    searchTerm: string;
    onSearchChange: (value: string) => void;
}> = ({ searchTerm, onSearchChange }) => (
    <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
            type="text"
            placeholder="Search question by name or number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-qc-light/10 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
    </div>
);


export default SearchBar;