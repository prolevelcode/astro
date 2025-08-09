import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import AuditTests from "@/components/audit-tests";
import EnvironmentConfig from "@/components/environment-config";
import LiveLogs from "@/components/live-logs";
import IssueDetector from "@/components/issue-detector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { Play, RefreshCw, CheckCircle, AlertCircle, XCircle, Rocket } from "lucide-react";

interface DashboardSummary {
  dependencies: { installed: number; total: number; percentage: number };
  formInputs: { working: number; total: number; percentage: number };
  apiConnections: { connected: number; total: number; percentage: number };
  buildStatus: string;
  lastAuditRun?: any;
  totalIssues: number;
  criticalIssues: number;
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [currentAuditRunId, setCurrentAuditRunId] = useState<string | null>(null);

  const { data: summary, refetch: refetchSummary } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const startFullAudit = async () => {
    try {
      const response = await apiRequest('POST', '/api/audit/start');
      const data = await response.json();
      setCurrentAuditRunId(data.auditRunId);
      refetchSummary();
    } catch (error) {
      console.error('Failed to start audit:', error);
    }
  };

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'audit_started') {
          setCurrentAuditRunId(data.auditRunId);
          refetchSummary();
        }
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.log('WebSocket not available, using polling');
    }
  }, [refetchSummary]);

  const renderMainContent = () => {
    switch (activeSection) {
      case "audit-tests":
        return <AuditTests currentAuditRunId={currentAuditRunId} />;
      case "environment":
        return <EnvironmentConfig />;
      case "api-testing":
        return <div className="p-6">API Testing Component</div>;
      case "reports":
        return <div className="p-6">Reports Component</div>;
      case "logs":
        return <LiveLogs />;
      default:
        return (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Quick Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dependencies</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary?.dependencies.installed || 0}/{summary?.dependencies.total || 25}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Progress value={summary?.dependencies.percentage || 0} className="flex-1" />
                    <span className="ml-2 text-sm text-gray-500">{summary?.dependencies.percentage || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Form Inputs</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary?.formInputs.working || 7}/{summary?.formInputs.total || 8}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="text-orange-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Progress value={summary?.formInputs.percentage || 87} className="flex-1" />
                    <span className="ml-2 text-sm text-gray-500">{summary?.formInputs.percentage || 87}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Connections</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary?.apiConnections.connected || 2}/{summary?.apiConnections.total || 3}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="text-red-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Progress value={summary?.apiConnections.percentage || 67} className="flex-1" />
                    <span className="ml-2 text-sm text-gray-500">{summary?.apiConnections.percentage || 67}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Build Status</p>
                      <p className="text-2xl font-semibold text-gray-900">{summary?.buildStatus || 'Ready'}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Rocket className="text-green-600" size={20} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Production Ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Column: Test Execution */}
              <div className="space-y-6">
                <AuditTests currentAuditRunId={currentAuditRunId} />
                <EnvironmentConfig />
              </div>

              {/* Right Column: Live Logs & Results */}
              <div className="space-y-6">
                <LiveLogs />
                <IssueDetector />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Project Audit Dashboard</h2>
              <p className="text-gray-600">Comprehensive debugging and testing suite for AstroMarket</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={startFullAudit} className="bg-blue-600 hover:bg-blue-700">
                <Play className="mr-2" size={16} />
                Run Full Audit
              </Button>
              <Button variant="outline" size="icon" onClick={() => refetchSummary()}>
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </header>

        {renderMainContent()}
      </main>
    </div>
  );
}
