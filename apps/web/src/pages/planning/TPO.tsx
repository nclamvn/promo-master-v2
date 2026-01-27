/**
 * TPO (Trade Promotion Optimization) Page
 * AI-powered promotion planning and optimization
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Play,
  CheckCircle,
  BarChart3,
  Calendar,
  Users,
  Package,
  Percent,
  Zap,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Types
interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: {
    revenue: number;
    roi: number;
    cost: number;
  };
  confidence: number;
  category: 'TIMING' | 'DISCOUNT' | 'CHANNEL' | 'PRODUCT' | 'CUSTOMER';
  status: 'NEW' | 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Mock data
const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    title: 'Shift Tet promotion timing by 1 week',
    description:
      'Historical data suggests starting Tet promotions 1 week earlier yields 15% higher engagement. Consumer spending patterns show peak activity begins earlier than currently planned.',
    impact: { revenue: 2500000000, roi: 18, cost: 500000000 },
    confidence: 92,
    category: 'TIMING',
    status: 'NEW',
    priority: 'HIGH',
  },
  {
    id: '2',
    title: 'Optimize discount depth for Pepsi 1.5L',
    description:
      'Current 15% discount is suboptimal. AI analysis suggests 12% discount achieves similar volume lift with better margin retention. Cannibalization effects considered.',
    impact: { revenue: 800000000, roi: 25, cost: -200000000 },
    confidence: 87,
    category: 'DISCOUNT',
    status: 'NEW',
    priority: 'HIGH',
  },
  {
    id: '3',
    title: 'Reallocate budget from MT to GT in Mekong',
    description:
      'GT channel in Mekong region shows 23% higher response rate to promotions. Recommend shifting 20% of MT budget to GT for this region.',
    impact: { revenue: 1200000000, roi: 15, cost: 0 },
    confidence: 78,
    category: 'CHANNEL',
    status: 'ACCEPTED',
    priority: 'MEDIUM',
  },
  {
    id: '4',
    title: 'Bundle Aquafina with snacks for Tet',
    description:
      'Cross-category analysis shows strong affinity between Aquafina and snack products during Tet. Bundling could increase basket size by 30%.',
    impact: { revenue: 600000000, roi: 22, cost: 100000000 },
    confidence: 85,
    category: 'PRODUCT',
    status: 'NEW',
    priority: 'MEDIUM',
  },
  {
    id: '5',
    title: 'Target high-value customers with premium offers',
    description:
      'Segment analysis identifies 15% of customers generating 45% of promotion revenue. Personalized premium offers recommended.',
    impact: { revenue: 900000000, roi: 30, cost: 150000000 },
    confidence: 81,
    category: 'CUSTOMER',
    status: 'IMPLEMENTED',
    priority: 'HIGH',
  },
];

const optimizationData = [
  { metric: 'ROI', current: 65, optimized: 85, max: 100 },
  { metric: 'Reach', current: 70, optimized: 82, max: 100 },
  { metric: 'Efficiency', current: 55, optimized: 78, max: 100 },
  { metric: 'Margin', current: 60, optimized: 72, max: 100 },
  { metric: 'Volume', current: 80, optimized: 88, max: 100 },
];

const scenarioData = [
  { month: 'Jan', conservative: 3200, balanced: 3800, aggressive: 4500 },
  { month: 'Feb', conservative: 3400, balanced: 4200, aggressive: 5000 },
  { month: 'Mar', conservative: 3600, balanced: 4500, aggressive: 5500 },
  { month: 'Apr', conservative: 3800, balanced: 4800, aggressive: 6000 },
  { month: 'May', conservative: 4000, balanced: 5000, aggressive: 6200 },
  { month: 'Jun', conservative: 4200, balanced: 5200, aggressive: 6500 },
];

// Utility functions
const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `₫${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `₫${(value / 1000000).toFixed(0)}M`;
  }
  return `₫${value.toLocaleString('vi-VN')}`;
};

const getCategoryIcon = (category: AIRecommendation['category']) => {
  const icons = {
    TIMING: Calendar,
    DISCOUNT: Percent,
    CHANNEL: BarChart3,
    PRODUCT: Package,
    CUSTOMER: Users,
  };
  return icons[category];
};

const getPriorityBadge = (priority: AIRecommendation['priority']) => {
  const config = {
    HIGH: { variant: 'destructive' as const, label: 'High Priority' },
    MEDIUM: { variant: 'warning' as const, label: 'Medium' },
    LOW: { variant: 'outline' as const, label: 'Low' },
  };
  return <Badge variant={config[priority].variant}>{config[priority].label}</Badge>;
};

const getStatusBadge = (status: AIRecommendation['status']) => {
  const config = {
    NEW: { variant: 'default' as const, label: 'New', icon: Sparkles },
    ACCEPTED: { variant: 'success' as const, label: 'Accepted', icon: CheckCircle },
    REJECTED: { variant: 'secondary' as const, label: 'Rejected', icon: ThumbsDown },
    IMPLEMENTED: { variant: 'outline' as const, label: 'Implemented', icon: Award },
  };
  const { variant, label, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default function TPOPage() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('balanced');
  const [budgetConstraint, setBudgetConstraint] = useState([70]);
  const [includeCannibalisation, setIncludeCannibalisation] = useState(true);
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  const handleAccept = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'ACCEPTED' as const } : r))
    );
  };

  const handleReject = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r))
    );
  };

  const runOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 3000);
  };

  // Calculate summary stats
  const newRecommendations = recommendations.filter((r) => r.status === 'NEW');
  const acceptedRecommendations = recommendations.filter((r) => r.status === 'ACCEPTED');
  const totalPotentialRevenue = recommendations
    .filter((r) => r.status === 'NEW' || r.status === 'ACCEPTED')
    .reduce((sum, r) => sum + r.impact.revenue, 0);
  const avgConfidence =
    recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Trade Promotion Optimization
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered recommendations to maximize promotion ROI
            </p>
          </div>
        </div>
        <Button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="bg-gradient-to-r from-purple-500 to-indigo-600"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Run Optimization
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">recommendations to review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPotentialRevenue)}</div>
            <p className="text-xs text-muted-foreground">from accepted insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConfidence.toFixed(0)}%</div>
            <Progress value={avgConfidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">ready to implement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Engine</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => {
              const CategoryIcon = getCategoryIcon(rec.category);
              return (
                <Card key={rec.id} className="overflow-hidden">
                  <div className="flex">
                    {/* Left accent bar */}
                    <div
                      className={`w-1 ${
                        rec.priority === 'HIGH'
                          ? 'bg-red-500'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{rec.title}</h3>
                              {getPriorityBadge(rec.priority)}
                              {getStatusBadge(rec.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rec.description}
                            </p>

                            {/* Impact metrics */}
                            <div className="flex items-center gap-6 mt-3">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">
                                  +{formatCurrency(rec.impact.revenue)}
                                </span>
                                <span className="text-xs text-muted-foreground">revenue</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Percent className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">{rec.impact.roi}%</span>
                                <span className="text-xs text-muted-foreground">ROI</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">
                                  {rec.impact.cost >= 0 ? '+' : ''}
                                  {formatCurrency(rec.impact.cost)}
                                </span>
                                <span className="text-xs text-muted-foreground">cost</span>
                              </div>
                            </div>

                            {/* Confidence bar */}
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-muted-foreground">
                                AI Confidence:
                              </span>
                              <Progress value={rec.confidence} className="h-2 w-24" />
                              <span className="text-xs font-medium">{rec.confidence}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {rec.status === 'NEW' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(rec.id)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleAccept(rec.id)}>
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Optimization Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Parameters</CardTitle>
                <CardDescription>Configure AI optimization constraints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Budget Utilization Target (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={budgetConstraint[0]}
                      onChange={(e) => setBudgetConstraint([parseInt(e.target.value) || 0])}
                      className="w-24"
                    />
                    <Progress value={budgetConstraint[0]} className="flex-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Primary Objective</Label>
                  <Select defaultValue="roi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roi">Maximize ROI</SelectItem>
                      <SelectItem value="revenue">Maximize Revenue</SelectItem>
                      <SelectItem value="volume">Maximize Volume</SelectItem>
                      <SelectItem value="margin">Maximize Margin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cannibalization">Include Cannibalization Effects</Label>
                  <Switch
                    id="cannibalization"
                    checked={includeCannibalisation}
                    onCheckedChange={setIncludeCannibalisation}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="competitive">Consider Competitive Activity</Label>
                  <Switch id="competitive" defaultChecked />
                </div>

                <Button className="w-full" onClick={runOptimization} disabled={isOptimizing}>
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Optimization
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Optimization Results Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Impact</CardTitle>
                <CardDescription>Current vs Optimized performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={optimizationData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Optimized"
                      dataKey="optimized"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scenario Comparison</CardTitle>
                  <CardDescription>
                    Compare different budget allocation strategies
                  </CardDescription>
                </div>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}B`} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conservative"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    name="Conservative"
                  />
                  <Line
                    type="monotone"
                    dataKey="balanced"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Balanced"
                  />
                  <Line
                    type="monotone"
                    dataKey="aggressive"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Aggressive"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scenario Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                id: 'conservative',
                name: 'Conservative',
                budget: 20000000000,
                roi: 15,
                revenue: 23000000000,
                risk: 'LOW',
                color: 'bg-slate-500',
              },
              {
                id: 'balanced',
                name: 'Balanced',
                budget: 28000000000,
                roi: 18,
                revenue: 33000000000,
                risk: 'MEDIUM',
                color: 'bg-blue-500',
              },
              {
                id: 'aggressive',
                name: 'Aggressive',
                budget: 35000000000,
                roi: 22,
                revenue: 42000000000,
                risk: 'HIGH',
                color: 'bg-purple-500',
              },
            ].map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'ring-2 ring-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${scenario.color}`} />
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                    </div>
                    <Badge
                      variant={
                        scenario.risk === 'LOW'
                          ? 'outline'
                          : scenario.risk === 'MEDIUM'
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {scenario.risk} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-mono">{formatCurrency(scenario.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected ROI</span>
                    <span className="font-mono text-green-600">{scenario.roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projected Revenue</span>
                    <span className="font-mono">{formatCurrency(scenario.revenue)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
