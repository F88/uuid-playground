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
import { Info, RefreshCw, ClipboardCopy, Download, Trash2 } from 'lucide-react';

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

  const handleGenerate = () => {
    const newUuid = generateUuid(selectedVersion);
    setGeneratedUuids([newUuid, ...generatedUuids]);
    setUuidToAnalyze(newUuid);
  };

  const handleGenerateBatch = () => {
    const batch = Array.from({ length: quantity }, () =>
      generateUuid(selectedVersion),
    );
    setGeneratedUuids([...batch, ...generatedUuids]);
  };

  const handleClear = () => {
    setGeneratedUuids([]);
  };

  const handleCopyToClipboard = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    toast.success(uuid, {
      icon: <ClipboardCopy className="w-4 h-4"/>,
    });
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
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              UUID Generator & Decoder
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              The playground for UUID generation & decoding.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* UUID Analysis Card */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Info className="w-5 h-5"/>
                  UUID Decoder
                </CardTitle>
                <CardDescription>
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
                        className="bg-input font-mono border-border focus:ring-accent flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyToClipboard(uuidToAnalyze)}
                        className="hover:bg-accent"
                        disabled={!uuidAnalysis?.isValid}
                      >
                        <ClipboardCopy className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>
                  {/* Analysis Results */}
                  {uuidAnalysis && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-primary">
                        Analysis Results
                      </h4>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valid:</span>
                          <span
                            className={
                              uuidAnalysis.isValid
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {uuidAnalysis.isValid ? 'Yes' : 'No'}
                          </span>
                        </div>

                        {uuidAnalysis.isValid && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Version:
                              </span>
                              <span>{uuidAnalysis.version}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Variant:
                              </span>
                              <span>{uuidAnalysis.variant}</span>
                            </div>

                            {uuidAnalysis.timestamp && (
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Timestamp:
                                  </span>
                                  <span className="font-mono text-xs">
                                    {uuidAnalysis.timestamp}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-xs">
                                    Date:
                                  </span>
                                  <span className="text-xs">
                                    {formatTimestamp(
                                      uuidAnalysis.timestamp,
                                      uuidAnalysis.version!,
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}

                            {uuidAnalysis.clockSeq && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Clock Sequence:
                                </span>
                                <span className="font-mono text-xs">
                                  {uuidAnalysis.clockSeq}
                                </span>
                              </div>
                            )}

                            {uuidAnalysis.node && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Node:
                                </span>
                                <span className="font-mono text-xs">
                                  {uuidAnalysis.node}
                                </span>
                              </div>
                            )}

                            {uuidAnalysis.randomBits && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Random Bits:
                                </span>
                                <span className="font-mono text-xs break-all">
                                  {uuidAnalysis.randomBits}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Hex String:
                              </span>
                              <span className="font-mono text-xs break-all">
                                {uuidAnalysis.hexString}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* UUID Generation Card */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <RefreshCw className="w-5 h-5"/>
                  UUID Generator
                </CardTitle>
                <CardDescription>
                  Generate UUID with selected version
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">UUID Version</label>
                  <ToggleGroup
                    type="single"
                    value={selectedVersion}
                    onValueChange={(value: UUIDVersion) =>
                      value && setSelectedVersion(value)
                    }
                    className="w-full grid grid-cols-3"
                  >
                    <ToggleGroupItem
                      variant="outline"
                      value="1"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      1
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      variant="outline"
                      value="4"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      4
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      variant="outline"
                      value="7"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      7
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-accent text-primary-foreground"
                  onClick={handleGenerate}
                >
                  Generate UUID
                </Button>

                <div className="space-y-2">
                  <label
                    htmlFor="quantity-input"
                    className="text-sm font-medium"
                  >
                    Quantity (1-100)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="quantity-input"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="5"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(100, parseInt(e.target.value, 10)))
                      }
                      className="w-min bg-input border-border focus:ring-accent"
                    />
                    <Button
                      className="w-full bg-primary hover:bg-accent text-primary-foreground"
                      onClick={handleGenerateBatch}
                    >
                      Generate Batch
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated UUIDs Card */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-primary">
                    Generated UUIDs
                  </CardTitle>
                  <CardDescription>
                    Click any UUID to copy to clipboard
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {generatedUuids.length} UUIDs
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent"
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
                    className="border-border hover:bg-accent"
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
                      className="flex items-center justify-between bg-input p-3 rounded-md font-mono text-sm"
                      onClick={() => handleCopyToClipboard(uuid)}
                    >
                      <span>{uuid}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No UUIDs generated yet.
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
