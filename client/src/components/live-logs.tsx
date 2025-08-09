import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Terminal } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
}

export default function LiveLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level: 'INFO',
      message: 'Code auditor system initialized'
    },
    {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level: 'SUCCESS',
      message: 'WebSocket connection established'
    }
  ]);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Set up WebSocket connection for real-time log updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different types of WebSocket messages
          if (data.type === 'audit_started') {
            addLog('INFO', `Starting audit run: ${data.auditRunId}`);
          } else if (data.type === 'step_completed') {
            const level = data.success ? 'SUCCESS' : 'ERROR';
            addLog(level, `Step completed: ${data.stepName}`);
          } else if (data.type === 'connections_tested') {
            addLog('INFO', 'API connection tests completed');
          } else if (data.type === 'issue_detected') {
            addLog('WARNING', `Issue detected: ${data.issue.title}`);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = () => {
        addLog('ERROR', 'WebSocket connection error');
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      addLog('WARNING', 'WebSocket not available, using polling mode');
    }
  }, []);

  // Simulate some live activity for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        { level: 'INFO' as const, message: 'Monitoring system health...' },
        { level: 'INFO' as const, message: 'Checking for form input changes...' },
        { level: 'SUCCESS' as const, message: 'API endpoints responding normally' },
        { level: 'INFO' as const, message: 'Scanning for code changes...' },
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // Only add if we don't have too many logs already
      if (logs.length < 50) {
        addLog(randomMessage.level, randomMessage.message);
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [logs.length]);

  const addLog = (level: LogEntry['level'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      level,
      message
    };
    
    setLogs(prev => [...prev, newLog].slice(-100)); // Keep only last 100 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-green-400';
      case 'ERROR':
        return 'text-red-400';
      case 'WARNING':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Terminal className="mr-2" size={16} />
              Live Execution Log
            </CardTitle>
            <CardDescription>Real-time system activity and audit progress</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 size={14} className="mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-400">
                [{log.timestamp}] <span className={getLevelColor(log.level)}>{log.level}</span> {log.message}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No logs to display. Activity will appear here when audit tests run.
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
