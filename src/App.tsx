import { useState, useEffect } from 'react';
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast, Toaster } from 'sonner';
import { Info, RefreshCw, ClipboardCopy, Download, Trash2, Sparkles, Zap } from 'lucide-react';

type UUIDVersion = '1' | '4' | '7';

interface UUIDAnalysis {
  isValid: boolean;
  version?: number;
  variant?: string;
  timestamp?: string;
  clockSeq?: string;
  node?: string;
  randomBits?: string;
  hexString: string;
}

const analyzeUUID = (uuid: string): UUIDAnalysis => {
  const cleanUuid = uuid.replace(/-/g, '');

  if (!/^[0-9a-fA-F]{32}$/.test(cleanUuid)) {
    return {
      isValid: false,
      hexString: uuid,
    };
  }

  const version = parseInt(cleanUuid[12], 16);
  const variantBits = parseInt(cleanUuid[16], 16);

  let variant = 'Unknown';
  if ((variantBits & 0x8) === 0) {
    variant = 'Reserved (NCS)';
  } else if ((variantBits & 0xc) === 0x8) {
    variant = 'RFC 4122';
  } else if ((variantBits & 0xe) === 0xc) {
    variant = 'Microsoft';
  } else {
    variant = 'Reserved';
  }

  const analysis: UUIDAnalysis = {
    isValid: true,
    version,
    variant,
    hexString: cleanUuid,
  };

  // Version-specific parsing
  switch (version) {
    case 1:
      // Time-based UUID
      const timeLow = cleanUuid.substring(0, 8);
      const timeMid = cleanUuid.substring(8, 12);
      const timeHi = cleanUuid.substring(12, 16);
      const clockSeqHi = cleanUuid.substring(16, 18);
      const clockSeqLow = cleanUuid.substring(18, 20);
      const node = cleanUuid.substring(20, 32);

      analysis.timestamp = `${timeLow}-${timeMid}-${timeHi}`;
      analysis.clockSeq = `${clockSeqHi}${clockSeqLow}`;
      analysis.node = node;
      break;

    case 4:
      // Random UUID
      analysis.randomBits = cleanUuid;
      break;

    case 7:
      // Time-ordered UUID
      const timestampMs = cleanUuid.substring(0, 12);
      const randomA = cleanUuid.substring(12, 16);
      const randomB = cleanUuid.substring(16, 32);

      analysis.timestamp = timestampMs;
      analysis.randomBits = `${randomA}${randomB}`;
      break;
  }

  return analysis;
};

const formatTimestamp = (timestamp: string, version: number): string => {
  try {
    if (version === 1) {
      // UUID v1 timestamp format: 60-bit timestamp in 100-nanosecond intervals since 1582-10-15
      const timeLow = timestamp.substring(0, 8);
      const timeMid = timestamp.substring(9, 13);
      const timeHi = timestamp.substring(14, 18);

      // Remove version bits from timeHi
      const timeHiAndVersion = parseInt(timeHi, 16);
      const timeHiOnly = timeHiAndVersion & 0x0fff;

      // Reconstruct 60-bit timestamp
      const fullTimestamp =
        (BigInt(timeHiOnly) << 48n) |
        (BigInt(parseInt(timeMid, 16)) << 32n) |
        BigInt(parseInt(timeLow, 16));

      // Convert to milliseconds since Unix epoch
      // UUID epoch starts at 1582-10-15 00:00:00 UTC
      const uuidEpochOffset = 122192928000000000n; // 100-nanosecond intervals
      const unixTimestamp = (fullTimestamp - uuidEpochOffset) / 10000n;

      const date = new Date(Number(unixTimestamp));
      return date.toISOString();
    } else if (version === 7) {
      // UUID v7 timestamp format: 48-bit Unix timestamp in milliseconds
      const timestampMs = parseInt(timestamp, 16);
      const date = new Date(timestampMs);
      return date.toISOString();
    }
  } catch (error) {
    return 'Invalid timestamp';
  }

  return 'Unknown format';
};

function App() {
  const [uuidToAnalyze, setUuidToAnalyze] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<UUIDVersion>('7');
  const [quantity, setQuantity] = useState(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [uuidAnalysis, setUuidAnalysis] = useState<UUIDAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (uuidToAnalyze.trim()) {
      const analysis = analyzeUUID(uuidToAnalyze.trim());
      setUuidAnalysis(analysis);
    } else {
      setUuidAnalysis(null);
    }
  }, [uuidToAnalyze]);

  const generateUuid = (version: UUIDVersion): string => {
    switch (version) {
      case '1':
        return uuidv1();
      case '4':
        return uuidv4();
      case '7':
        return uuidv7();
      default:
        return uuidv4();
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newUuid = generateUuid(selectedVersion);
    setGeneratedUuids([newUuid, ...generatedUuids]);
    setUuidToAnalyze(newUuid);
    setIsGenerating(false);
  };

  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    // Small delay to show loading state for batch generation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const batch = Array.from({ length: quantity }, () =>
      generateUuid(selectedVersion),
    );
    setGeneratedUuids([...batch, ...generatedUuids]);
    setIsGenerating(false);
  };

  const handleClear = () => {
    setGeneratedUuids([]);
  };

  const handleCopyToClipboard = async (uuid: string) => {
    if (!navigator.clipboard) {
      toast.error('Clipboard API not available in this browser.');
      return;
    }
    try {
      await navigator.clipboard.writeText(uuid);
      toast.success(uuid, {
        icon: <ClipboardCopy className="w-4 h-4"/>,
      });
    } catch (err) {
      toast.error('Failed to copy UUID to clipboard.');
      console.error('Failed to copy: ', err);
    }
  };

  const handleExport = () => {
    if (generatedUuids.length === 0) {
      toast.error('No UUIDs to export.');
      return;
    }
    const content = generatedUuids.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uuids.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('UUIDs exported successfully.');
  };

  return (
    <>
      <div className="min-h-screen bg-background font-sans text-foreground">
        <main className="container mx-auto px-4 py-12">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-accent to-accent/80 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                UUID Generator & Decoder
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The professional playground for UUID generation & decoding. 
              Create, analyze, and manage UUIDs with precision and style.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* UUID Analysis Card */}
            <Card className="card-enhanced border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-xl font-semibold">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Info className="w-5 h-5 text-primary"/>
                  </div>
                  UUID Decoder
                </CardTitle>
                <CardDescription className="text-base">
                  Decode UUID to view its metadata and structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="uuid-analyze-input"
                      className="text-sm font-medium"
                    >
                      UUID
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="uuid-analyze-input"
                        placeholder="Enter a UUID to analyze..."
                        value={uuidToAnalyze}
                        onChange={(e) => setUuidToAnalyze(e.target.value)}
                        className="bg-input font-mono border-border focus:ring-accent flex-1 transition-all duration-200"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyToClipboard(uuidToAnalyze)}
                        className="hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                        disabled={!uuidAnalysis?.isValid}
                      >
                        <ClipboardCopy className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>
                  {/* Analysis Results */}
                  {uuidAnalysis && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Analysis Results
                      </h4>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                          <span className="text-muted-foreground font-medium">Valid:</span>
                          <span
                            className={`font-semibold px-2 py-1 rounded text-xs ${
                              uuidAnalysis.isValid
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {uuidAnalysis.isValid ? 'Yes' : 'No'}
                          </span>
                        </div>

                        {uuidAnalysis.isValid && (
                          <div className="space-y-2">
                            <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                              <span className="text-muted-foreground font-medium">
                                Version:
                              </span>
                              <span className="font-mono font-semibold">{uuidAnalysis.version}</span>
                            </div>

                            <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                              <span className="text-muted-foreground font-medium">
                                Variant:
                              </span>
                              <span className="font-mono text-xs">{uuidAnalysis.variant}</span>
                            </div>

                            {uuidAnalysis.timestamp && (
                              <div className="space-y-2">
                                <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                                  <span className="text-muted-foreground font-medium">
                                    Timestamp:
                                  </span>
                                  <span className="font-mono text-xs">
                                    {uuidAnalysis.timestamp}
                                  </span>
                                </div>
                                <div className="flex justify-between p-2 rounded-lg bg-accent/10">
                                  <span className="text-muted-foreground font-medium text-xs">
                                    Date:
                                  </span>
                                  <span className="text-xs font-medium">
                                    {formatTimestamp(
                                      uuidAnalysis.timestamp,
                                      uuidAnalysis.version!,
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}

                            {uuidAnalysis.clockSeq && (
                              <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                                <span className="text-muted-foreground font-medium">
                                  Clock Sequence:
                                </span>
                                <span className="font-mono text-xs">
                                  {uuidAnalysis.clockSeq}
                                </span>
                              </div>
                            )}

                            {uuidAnalysis.node && (
                              <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                                <span className="text-muted-foreground font-medium">
                                  Node:
                                </span>
                                <span className="font-mono text-xs">
                                  {uuidAnalysis.node}
                                </span>
                              </div>
                            )}

                            {uuidAnalysis.randomBits && (
                              <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                                <span className="text-muted-foreground font-medium">
                                  Random Bits:
                                </span>
                                <span className="font-mono text-xs break-all">
                                  {uuidAnalysis.randomBits}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between p-2 rounded-lg bg-primary/5">
                              <span className="text-muted-foreground font-medium">
                                Hex String:
                              </span>
                              <span className="font-mono text-xs break-all font-semibold">
                                {uuidAnalysis.hexString}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* UUID Generation Card */}
            <Card className="card-enhanced border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-xl font-semibold">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <RefreshCw className="w-5 h-5 text-accent"/>
                  </div>
                  UUID Generator
                </CardTitle>
                <CardDescription className="text-base">
                  Generate UUID with selected version
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">UUID Version</label>
                  <ToggleGroup
                    type="single"
                    value={selectedVersion}
                    onValueChange={(value: UUIDVersion) =>
                      value && setSelectedVersion(value)
                    }
                    className="w-full grid grid-cols-3 gap-2"
                  >
                    <ToggleGroupItem
                      variant="outline"
                      value="1"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/10 transition-all duration-200"
                    >
                      1
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      variant="outline"
                      value="4"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/10 transition-all duration-200"
                    >
                      4
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      variant="outline"
                      value="7"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/10 transition-all duration-200"
                    >
                      7
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <Button
                  className={`w-full btn-accent-enhanced text-accent-foreground font-semibold py-6 text-base ${isGenerating ? 'loading-pulse' : ''}`}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Generate UUID'}
                </Button>

                <div className="space-y-3">
                  <label
                    htmlFor="quantity-input"
                    className="text-sm font-medium"
                  >
                    Quantity (1-100)
                  </label>
                  <div className="flex space-x-3">
                    <Input
                      id="quantity-input"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="5"
                      value={quantity}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        setQuantity(Math.min(100, isNaN(parsed) ? 1 : parsed));
                      }}
                      className="w-24 bg-input border-border focus:ring-accent transition-all duration-200"
                    />
                    <Button
                      className={`flex-1 btn-primary-enhanced text-primary-foreground font-semibold ${isGenerating ? 'loading-pulse' : ''}`}
                      onClick={handleGenerateBatch}
                      disabled={isGenerating}
                    >
                      <Zap className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
                      {isGenerating ? 'Generating...' : 'Generate Batch'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated UUIDs Card */}
          <Card className="card-enhanced border-border">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-primary text-xl font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ClipboardCopy className="w-5 h-5 text-primary"/>
                    </div>
                    Generated UUIDs
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Click any UUID to copy to clipboard
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-medium px-3 py-1 bg-muted/30 rounded-full">
                    {generatedUuids.length} UUIDs
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                    onClick={handleExport}
                    disabled={generatedUuids.length < 1}
                  >
                    <Download className="w-4 h-4 mr-2"/>
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="border-border hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                    disabled={generatedUuids.length < 1}
                  >
                    <Trash2 className="w-4 h-4 mr-2"/>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedUuids.length > 0 ? (
                  generatedUuids.map((uuid, index) => (
                    <div
                      key={index}
                      className="uuid-item flex items-center justify-between bg-input p-4 rounded-lg font-mono text-sm group"
                      onClick={() => handleCopyToClipboard(uuid)}
                    >
                      <span className="flex-1 select-all">{uuid}</span>
                      <ClipboardCopy className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 p-4 rounded-full bg-muted/30">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Generate</h3>
                      <p className="text-muted-foreground">
                        Click "Generate UUID" above to create your first UUID.
                        <br />
                        All generated UUIDs will appear here for easy copying.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <Toaster/>
    </>
  );
}

export default App;
