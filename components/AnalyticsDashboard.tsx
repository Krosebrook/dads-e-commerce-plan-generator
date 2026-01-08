import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, TrendingUp, Users, Zap, Target, Activity } from 'lucide-react';

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  properties?: Record<string, any>;
}

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    phaseCompletions: 0,
    venturesCreated: 0,
    averageTimePerPhase: 0
  });

  useEffect(() => {
    // Load analytics events from localStorage (simulated analytics)
    const loadedEvents = loadAnalyticsFromStorage();
    setEvents(loadedEvents);
    calculateStats(loadedEvents);
  }, []);

  const loadAnalyticsFromStorage = (): AnalyticsEvent[] => {
    try {
      const data = localStorage.getItem('blink-analytics-events');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const calculateStats = (events: AnalyticsEvent[]) => {
    const phaseEvents = events.filter(e => e.event === 'phase_completed');
    const ventureEvents = events.filter(e => e.event === 'phase_completed' && e.properties?.phase === 'venture_created');
    
    // Calculate average time between phases (simplified)
    let totalTime = 0;
    if (phaseEvents.length > 1) {
      for (let i = 1; i < phaseEvents.length; i++) {
        totalTime += phaseEvents[i].timestamp - phaseEvents[i - 1].timestamp;
      }
      totalTime = totalTime / (phaseEvents.length - 1);
    }

    setStats({
      totalEvents: events.length,
      phaseCompletions: phaseEvents.length,
      venturesCreated: ventureEvents.length,
      averageTimePerPhase: Math.round(totalTime / 1000 / 60) // Convert to minutes
    });
  };

  const getEventsByPhase = () => {
    const phaseMap: Record<string, number> = {};
    events.forEach(event => {
      if (event.event === 'phase_completed' && event.properties?.phase) {
        const phase = event.properties.phase;
        phaseMap[phase] = (phaseMap[phase] || 0) + 1;
      }
    });
    return phaseMap;
  };

  const getRecentEvents = () => {
    return events.slice(-10).reverse();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const phaseStats = getEventsByPhase();
  const recentEvents = getRecentEvents();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-500" />
            Analytics Dashboard
          </h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 w-10 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Events</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalEvents}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Phase Completions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.phaseCompletions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ventures Created</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.venturesCreated}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Time/Phase</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageTimePerPhase}m</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Phase Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Phase Completions Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(phaseStats).map(([phase, count]) => (
                <div key={phase} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                    {phase.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((count / stats.phaseCompletions) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
              {Object.keys(phaseStats).length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  No phase completions yet. Start generating content to see analytics!
                </p>
              )}
            </div>
          </Card>

          {/* Recent Events */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {recentEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {event.event.replace(/_/g, ' ')}
                    </p>
                    {event.properties && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {Object.entries(event.properties)
                          .filter(([key]) => !key.startsWith('_'))
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-3 whitespace-nowrap">
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                  No recent events. Start using the app to track your activity!
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
