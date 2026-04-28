import { useState, useEffect } from 'react';
import api from '../api';
import { Search, Filter, Mail, Briefcase, GraduationCap, Calendar } from 'lucide-react';

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    programme: '',
    industrySector: '',
    graduationDate: ''
  });

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.programme) params.append('programme', filters.programme);
      if (filters.industrySector) params.append('industrySector', filters.industrySector);
      if (filters.graduationDate) params.append('graduationDate', filters.graduationDate);

      const res = await api.get(`/profiles/search?${params.toString()}`);
      setAlumni(res.data);
    } catch (err) {
      console.error('Failed to fetch alumni', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0 border-none">Alumni Directory</h1>
          <p className="text-gray-500 mt-1">Search and filter across the alumni network</p>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
          <input
            type="text"
            name="programme"
            value={filters.programme}
            onChange={handleFilterChange}
            placeholder="e.g. Computer Science"
            className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
          <input
            type="text"
            name="industrySector"
            value={filters.industrySector}
            onChange={handleFilterChange}
            placeholder="e.g. Technology"
            className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
          <input
            type="text"
            name="graduationDate"
            value={filters.graduationDate}
            onChange={handleFilterChange}
            placeholder="e.g. 2024"
            className="w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading directory...</div>
      ) : alumni.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-50 flex items-center justify-center rounded-full mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No alumni found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((profile) => (
            <div key={profile._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-24 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
              <div className="px-6 pb-6">
                <div className="flex gap-4 mb-4">
                  <div className="-mt-12 w-24 h-24 shrink-0 border-4 border-white rounded-full bg-gray-100 flex items-center justify-center overflow-hidden relative shadow-sm">
                    {profile.profileImage ? (
                      <img src={`http://localhost:3000${profile.profileImage}`} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-gray-400 font-bold">
                        {profile.user?.firstName?.[0]}
                      </span>
                    )}
                  </div>

                  <div className="pt-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {profile.user?.firstName} {profile.user?.lastName}
                    </h3>
                    <p className="text-sm text-purple-600 font-medium flex items-center gap-1 mt-1">
                      <Briefcase className="w-4 h-4" />
                      {profile.industrySector || 'Unspecified Industry'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    {profile.programme && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span>{profile.programme}</span>
                      </div>
                    )}
                    {profile.graduationDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(profile.graduationDate).getFullYear()}</span>
                      </div>
                    )}
                    {profile.user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${profile.user.email}`} className="text-gray-600 hover:text-purple-600">{profile.user.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
