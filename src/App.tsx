import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Info, RefreshCw, ClipboardCopy, Download, Trash2 } from "lucide-react";

function App() {
  const [uuidToAnalyze, setUuidToAnalyze] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("4");
  const [quantity, setQuantity] = useState(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  const handleGenerate = () => {
    // Placeholder for UUID generation logic
    const newUuid = `82a7a5a1-c77c-4288-87e3-d2c3c3fbc339`; // Example
    setGeneratedUuids([newUuid, ...generatedUuids]);
    setUuidToAnalyze(newUuid);
  };

  const handleGenerateBatch = () => {
    // Placeholder for batch UUID generation logic
    const batch = Array.from(
      { length: quantity },
      (_, i) => `6512d293-0198-1-9b47-7df285e839c4-${i}` // Example
    );
    setGeneratedUuids([...batch, ...generatedUuids]);
  };

  const handleClear = () => {
    setGeneratedUuids([]);
  };

  const handleCopyToClipboard = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    // Add toast notification here later
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            UUID Generator & Decoder
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Generate, analyze, and convert UUIDs with comprehensive metadata
            extraction
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* UUID Analysis Card */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Info className="w-5 h-5" />
                UUID Decorder
              </CardTitle>
              <CardDescription>
                Decode UUID to view its metadata and structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label
                  htmlFor="uuid-analyze-input"
                  className="text-sm font-medium"
                >
                  UUID
                </label>
                <Input
                  id="uuid-analyze-input"
                  placeholder="Enter a UUID to analyze..."
                  value={uuidToAnalyze}
                  onChange={(e) => setUuidToAnalyze(e.target.value)}
                  className="bg-input font-mono border-border focus:ring-accent"
                />
              </div>
            </CardContent>
          </Card>

          {/* UUID Generation Card */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <RefreshCw className="w-5 h-5" />
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
                  onValueChange={(value) => value && setSelectedVersion(value)}
                  className="w-full grid grid-cols-3"
                >
                  <ToggleGroupItem
                    value="1"
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Version 1
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="4"
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Version 4
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="7"
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Version 7
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleGenerate}
              >
                Generate UUID
              </Button>

              <div className="space-y-2">
                <label htmlFor="quantity-input" className="text-sm font-medium">
                  Quantity (1-1000)
                </label>
                <Input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  className="bg-input border-border focus:ring-accent"
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleGenerateBatch}
              >
                Generate Batch
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated UUIDs Card */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-primary">Generated UUIDs</CardTitle>
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
                  className="border-border hover:bg-muted"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="border-border hover:bg-muted"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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
                  >
                    <span>{uuid}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyToClipboard(uuid)}
                      className="hover:bg-muted"
                    >
                      <ClipboardCopy className="w-4 h-4" />
                    </Button>
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
  );
}

export default App;
