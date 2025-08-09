import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { Star, CreditCard, Users, Settings, Plus, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiConnection {
  id: string;
  service: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked?: string;
  errorMessage?: string | null;
  responseTime?: string | null;
}

interface EnvironmentVar {
  id: string;
  key: string;
  value: string;
  service?: string | null;
  isActive: boolean;
}

export default function EnvironmentConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVar, setNewVar] = useState({
    key: '',
    value: '',
    service: ''
  });

  const { data: connections = [] } = useQuery<ApiConnection[]>({
    queryKey: ["/api/connections"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: envVars = [] } = useQuery<EnvironmentVar[]>({
    queryKey: ["/api/environment/vars"],
  });

  const testConnectionMutation = useMutation({
    mutationFn: (service: string) => 
      apiRequest('POST', `/api/connections/${service}/test`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({ title: "Connection test completed" });
    },
  });

  const createEnvVarMutation = useMutation({
    mutationFn: (data: { key: string; value: string; service?: string }) =>
      apiRequest('POST', '/api/environment/vars', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/environment/vars"] });
      setIsDialogOpen(false);
      setNewVar({ key: '', value: '', service: '' });
      toast({ title: "Environment variable saved" });
    },
  });

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'prokerala':
        return <Star className="text-blue-600" size={16} />;
      case 'razorpay':
        return <CreditCard className="text-green-600" size={16} />;
      case 'goaffpro':
        return <Users className="text-red-600" size={16} />;
      default:
        return <Settings className="text-gray-600" size={16} />;
    }
  };

  const getServiceName = (service: string) => {
    switch (service) {
      case 'prokerala':
        return 'Prokerala API';
      case 'razorpay':
        return 'Razorpay API';
      case 'goaffpro':
        return 'GoAffPro API';
      default:
        return service;
    }
  };

  const getServiceDescription = (service: string) => {
    switch (service) {
      case 'prokerala':
        return 'Astrology service integration';
      case 'razorpay':
        return 'Payment processing';
      case 'goaffpro':
        return 'Affiliate tracking system';
      default:
        return 'Service integration';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle size={12} className="mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle size={12} className="mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Disconnected
          </Badge>
        );
    }
  };

  const handleTestConnection = (service: string) => {
    testConnectionMutation.mutate(service);
  };

  const handleCreateEnvVar = () => {
    if (!newVar.key || !newVar.value) {
      toast({ 
        title: "Error", 
        description: "Key and value are required",
        variant: "destructive" 
      });
      return;
    }
    
    createEnvVarMutation.mutate({
      key: newVar.key,
      value: newVar.value,
      service: newVar.service || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Configuration</CardTitle>
        <CardDescription>API keys and environment variables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connections.map((connection) => {
            const isConnected = connection.status === 'connected';
            const hasError = connection.status === 'error';
            
            return (
              <div key={connection.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                hasError ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getServiceIcon(connection.service)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getServiceName(connection.service)}</p>
                    <p className="text-sm text-gray-500">{getServiceDescription(connection.service)}</p>
                    {connection.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">{connection.errorMessage}</p>
                    )}
                    {connection.responseTime && isConnected && (
                      <p className="text-xs text-green-600 mt-1">Response: {connection.responseTime}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(connection.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestConnection(connection.service)}
                    disabled={testConnectionMutation.isPending}
                  >
                    Test
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Environment Variables</h4>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  Add Variable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Environment Variable</DialogTitle>
                  <DialogDescription>
                    Configure a new environment variable for API integration.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="key">Variable Name</Label>
                    <Input
                      id="key"
                      placeholder="e.g. PROKERALA_API_KEY"
                      value={newVar.key}
                      onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="password"
                      placeholder="Enter API key or value"
                      value={newVar.value}
                      onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Service (Optional)</Label>
                    <Select value={newVar.service} onValueChange={(value) => setNewVar({ ...newVar, service: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="prokerala">Prokerala</SelectItem>
                        <SelectItem value="razorpay">Razorpay</SelectItem>
                        <SelectItem value="goaffpro">GoAffPro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEnvVar}
                    disabled={createEnvVarMutation.isPending}
                  >
                    Save Variable
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {envVars.length > 0 ? envVars.map((envVar) => (
              <div key={envVar.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono">{envVar.key}</code>
                  {envVar.service && (
                    <Badge variant="outline" className="text-xs">
                      {envVar.service}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No environment variables configured
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
