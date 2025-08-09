import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TriangleAlert, InfoIcon, Wrench, Plug, Code, Rocket } from "lucide-react";

interface DetectedIssue {
  id: string;
  type: 'form_input' | 'api_connection' | 'environment' | 'build';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  filePath?: string | null;
  lineNumber?: string | null;
  recommendation: string | null;
  isResolved: boolean;
}

export default function IssueDetector() {
  const { data: issues = [] } = useQuery<DetectedIssue[]>({
    queryKey: ["/api/issues"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getIssueIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="text-red-600" size={16} />;
      case 'high':
        return <TriangleAlert className="text-orange-600" size={16} />;
      case 'medium':
        return <InfoIcon className="text-blue-600" size={16} />;
      default:
        return <InfoIcon className="text-gray-600" size={16} />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-700">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getIssueBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const unResolvedIssues = issues.filter(issue => !issue.isResolved);
  const criticalIssues = unResolvedIssues.filter(issue => issue.severity === 'critical');
  const highIssues = unResolvedIssues.filter(issue => issue.severity === 'high');

  return (
    <div className="space-y-6">
      {/* Issue Detection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Issues</CardTitle>
          <CardDescription>Problems found during audit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {unResolvedIssues.length > 0 ? unResolvedIssues.slice(0, 5).map((issue) => (
              <div key={issue.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${getIssueBorderColor(issue.severity)}`}>
                {getIssueIcon(issue.severity)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{issue.title}</p>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                  {issue.filePath && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {issue.filePath}{issue.lineNumber && `:${issue.lineNumber}`}
                    </p>
                  )}
                </div>
                {getSeverityBadge(issue.severity)}
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No issues detected. Run an audit to scan for problems.</p>
              </div>
            )}
            
            {unResolvedIssues.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Showing 5 of {unResolvedIssues.length} issues. View all in reports section.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common fixes and utilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
              disabled={false}
            >
              <Wrench size={16} />
              <span className="text-sm font-medium">Fix Form Inputs</span>
            </Button>
            <Button 
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plug size={16} />
              <span className="text-sm font-medium">Test APIs</span>
            </Button>
            <Button 
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700"
            >
              <Code size={16} />
              <span className="text-sm font-medium">Lint Code</span>
            </Button>
            <Button 
              className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700"
            >
              <Rocket size={16} />
              <span className="text-sm font-medium">Build Prod</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Report Summary */}
      {unResolvedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Summary</CardTitle>
            <CardDescription>Overall project health assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* What Works */}
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600 flex items-center">
                  <AlertCircle className="mr-2" size={16} />
                  What Works
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Dependencies install successfully</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Dev server starts without errors</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Build process completes successfully</span>
                  </div>
                </div>
              </div>

              {/* What Fails */}
              <div className="space-y-4">
                <h4 className="font-semibold text-red-600 flex items-center">
                  <AlertCircle className="mr-2" size={16} />
                  Issues Found ({unResolvedIssues.length})
                </h4>
                <div className="space-y-2 text-sm">
                  {unResolvedIssues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span>{issue.title}</span>
                    </div>
                  ))}
                  {unResolvedIssues.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{unResolvedIssues.length - 3} more issues
                    </div>
                  )}
                </div>
              </div>

              {/* Deployment Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-600 flex items-center">
                  <Rocket className="mr-2" size={16} />
                  Deployment Status
                </h4>
                <div className="space-y-2">
                  {criticalIssues.length > 0 ? (
                    <Badge variant="destructive" className="w-full justify-center">
                      Needs Critical Fixes ({criticalIssues.length})
                    </Badge>
                  ) : highIssues.length > 0 ? (
                    <Badge className="bg-orange-100 text-orange-700 w-full justify-center">
                      Needs Fixes ({highIssues.length})
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 w-full justify-center">
                      Ready for Deployment
                    </Badge>
                  )}
                  <p className="text-sm text-gray-600 text-center">
                    {criticalIssues.length > 0 
                      ? `${criticalIssues.length} critical issues must be resolved`
                      : highIssues.length > 0
                      ? `${highIssues.length} high priority issues recommended`
                      : "All systems operational"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
