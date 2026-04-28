import { useState, useEffect } from 'react';
import api from '../api';
import { Gavel, TrendingUp, AlertCircle, Info, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';

export default function Bidding() {
  const [bids, setBids] = useState([]);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newBid, setNewBid] = useState({
    bidAmount: '',
    bidForDate: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchBids = async () => {
    try {
      const [bidRes, countRes] = await Promise.all([
        api.get('/bids/my-bids'),
        api.get('/bids/monthly-count')
      ]);
      setBids(bidRes.data);
      setMonthlyCount(countRes.data.winCount || 0);
    } catch (err) {
      console.error('Failed to fetch bids', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const res = await api.post('/bids', {
        bidAmount: Number(newBid.bidAmount),
        bidForDate: newBid.bidForDate
      });
      setSubmitSuccess('Bid successfully placed/updated!');
      setNewBid({ bidAmount: '', bidForDate: '' });
      fetchBids(); // Refresh list
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to place bid. Remember you can only increase bids.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return <CheckCircle2 className="text-green-500 w-5 h-5" />;
      case 'lost': return <XCircle className="text-red-500 w-5 h-5" />;
      default: return <AlertCircle className="text-amber-500 w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0 border-none">Blind Bidding System</h1>
          <p className="text-gray-500 mt-1">Feature your profile on the main page for a specific day.</p>
        </div>
        <div className="bg-white border text-center border-purple-200 rounded-xl px-6 py-3 shadow-sm inline-flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-700" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-semibold text-gray-500 uppercase">Monthly Wins</span>
            <span className="block text-xl font-bold text-gray-900">{monthlyCount} / 3</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Place Bid Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <Gavel className="text-purple-600 w-5 h-5" />
              <h2 className="text-lg font-bold">Place a Bid</h2>
            </div>

            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl mb-6 flex gap-3">
              <Info className="w-5 h-5 shrink-0" />
              <p>Highest bids are hidden. You will find out your win/loss status at midnight. If outbid, you can only <strong>increase</strong> your previous bid.</p>
            </div>

            {submitError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{submitError}</div>}
            {submitSuccess && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">{submitSuccess}</div>}

            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <div className="relative">
                  <CalendarIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]} // Cannot bid on past
                    value={newBid.bidForDate}
                    onChange={(e) => setNewBid({ ...newBid, bidForDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount (Credits)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBid.bidAmount}
                  onChange={(e) => setNewBid({ ...newBid, bidAmount: e.target.value })}
                  className="w-full px-4 py-2 text-xl font-bold border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0"
                />
              </div>

              <button
                type="submit"
                disabled={monthlyCount >= 3}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors shadow-md shadow-purple-200 mt-2"
              >
                {monthlyCount >= 3 ? 'Monthly Limit Reached' : 'Submit Bid'}
              </button>
            </form>
          </div>
        </div>

        {/* My Bids History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold mb-4">Your Bid History</h2>

          {loading ? (
            <p>Loading history...</p>
          ) : bids.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You haven't placed any bids yet.</p>
            </div>
          ) : (
            bids.map((bid) => (
              <div key={bid._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${bid.status === 'won' ? 'bg-green-100 text-green-600' :
                      bid.status === 'lost' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                    }`}>
                    {getStatusIcon(bid.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Feature on {new Date(bid.bidForDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">Status: {bid.status}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-2xl font-black text-gray-900">{bid.amount}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Credits</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
