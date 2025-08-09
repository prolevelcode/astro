import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

interface AuditTestsProps {
  currentAuditRunId: string | null;
}

interface AuditStep {
  id: string;
  stepName: string;
  stepOrder: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  output?: string | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export default function AuditTests({ currentAuditRunId }: AuditTestsProps) {
  const { data: auditDetails } = useQuery({
    queryKey: ["/api/audit/runs", currentAuditRunId],
    enabled: !!currentAuditRunId,
    refetchInterval: 2000, // Refresh every 2 seconds when audit is running
  });

  const steps: AuditStep[] = (auditDetails as any)?.steps || [];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      case 'running':
        return <Loader2 className="text-blue-600 animate-spin" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700">✓ Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">✗ Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-700">⏳ In Progress</Badge>;
      default:
        return <Badge variant="secondary">⏸ Pending</Badge>;
    }
  };

  const getStepCommand = (stepName: string) => {
    const commands: Record<string, string> = {
      'Install Dependencies': 'npm install',
      'Local Dev Server Test': 'npm run dev',
      'Lint Code': 'npm run lint',
      'Search Blocked Inputs': 'grep -R "readonly|disabled" .',
      'Production Simulation': 'npm run build && npm start',
      'Console & Network Errors': 'DevTools Analysis',
    };
    return commands[stepName] || stepName;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Test Execution</CardTitle>
        <CardDescription>Step-by-step project analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.length > 0 ? steps.map((step) => {
            const stepNumber = step.stepOrder;
            const isCompleted = step.status === 'success' || step.status === 'failed';
            const borderColor = step.status === 'success' ? 'border-green-200' : 
                               step.status === 'failed' ? 'border-red-200' :
                               step.status === 'running' ? 'border-blue-200' : 'border-gray-200';
            const bgColor = step.status === 'success' ? 'bg-green-50' : 
                           step.status === 'failed' ? 'bg-red-50' :
                           step.status === 'running' ? 'bg-blue-50' : 'bg-gray-50';

            return (
              <div key={step.id} className={`flex items-start space-x-4 p-4 rounded-lg border ${borderColor} ${bgColor}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stepNumber}. {step.stepName}</h4>
                  <div className="mt-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {getStepCommand(step.stepName)}
                    </code>
                    <span className="ml-2">{getStepBadge(step.status)}</span>
                  </div>
                  {step.output && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {step.output.substring(0, 200)}{step.output.length > 200 ? '...' : ''}
                    </div>
                  )}
                  {step.errorMessage && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                      {step.errorMessage.substring(0, 200)}{step.errorMessage.length > 200 ? '...' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-gray-500">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No audit tests running. Click "Run Full Audit" to start testing.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
