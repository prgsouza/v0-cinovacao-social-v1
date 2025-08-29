"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaterialsTab from "./MaterialsTab";
import LendsTab from "./LendsTab";
import Loading from "./loading";
import MaterialsLayout from "./MaterialsLayout";

import { getMaterials, getLends, type Material, type Lend } from "@/lib/database";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lends, setLends] = useState<Lend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"materials" | "lends">("materials");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [materialsData, lendsData] = await Promise.all([getMaterials(), getLends()]);
        setMaterials(materialsData);
        setLends(lendsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loading />;

  return (
    <MaterialsLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "materials" | "lends")} className="w-full">
          <TabsContent value="materials">
            <MaterialsTab
              materials={materials}
              setMaterials={setMaterials}
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </TabsContent>

          <TabsContent value="lends">
            <LendsTab
              materials={materials}
              lends={lends}
              setLends={setLends}
              confirmDialog={confirmDialog}
              setConfirmDialog={setConfirmDialog}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MaterialsLayout>
  );
}
