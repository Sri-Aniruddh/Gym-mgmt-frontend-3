import React, { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import Badge from './Badge';

export const MemberSearchSelect = ({
  selectedMember,
  onSelectMember,
  onClear,
  label = 'Select Member',
  placeholder = 'Type member name, email, phone, or Member ID...',
  error = null,
  required = true,
  autoFocus = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch matching members whenever search term changes
  useEffect(() => {
    if (selectedMember) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/members', {
          params: {
            search: searchTerm.trim(),
            limit: 8
          }
        });
        if (res.data?.data) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Member search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedMember]);

  const handleSelect = (member) => {
    onSelectMember(member);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    if (onClear) onClear();
    setSearchTerm('');
    setIsOpen(true);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {/* When a member is selected */}
      {selectedMember ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-600/40 rounded-2xl shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            {selectedMember.profileImageUrl ? (
              <img
                src={selectedMember.profileImageUrl}
                alt={selectedMember.userId?.name}
                className="w-10 h-10 rounded-xl object-cover border border-emerald-400 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-sm">
                {selectedMember.userId?.name?.charAt(0) || 'M'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {selectedMember.userId?.name || 'Selected Member'}
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-black bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {selectedMember.memberId}
                </span>
                <Badge status={selectedMember.status} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {selectedMember.userId?.email} {selectedMember.phone ? `• ${selectedMember.phone}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer ml-2"
            title="Choose a different member"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Search Input & Dropdown */
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className={`w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors ${
                error
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
              }`}
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-emerald-500 animate-spin absolute right-3.5 top-3 pointer-events-none" />
            )}
          </div>

          {/* Results Dropdown list */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 animate-fade-in">
              {results.length > 0 ? (
                results.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => handleSelect(m)}
                    className="w-full text-left p-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800/60 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {m.profileImageUrl ? (
                        <img
                          src={m.profileImageUrl}
                          alt={m.userId?.name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {m.userId?.name?.charAt(0) || 'M'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {m.userId?.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400">
                            {m.memberId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {m.phone} • {m.userId?.email}
                        </p>
                      </div>
                    </div>
                    <Badge status={m.status} className="shrink-0" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  {isLoading ? 'Searching registered members...' : 'No matching members found.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default MemberSearchSelect;
