export interface FloaterManifest {
    id: string;
    title: string; // Internal title, not necessarily displayed
    icon: React.ReactNode;
    defaultColor: string;
    defaultSize: { width: number; height: number };
}
