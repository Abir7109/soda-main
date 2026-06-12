export type ToolStatus = 'pending' | 'running' | 'done' | 'error';

export interface SystemStatusData {
  cpu_percent: number;
  ram_percent: number;
  ram_total_gb: number;
  ram_used_gb: number;
  disk_percent: number;
  disk_total_gb: number;
  disk_used_gb: number;
  cpu_count: number;
  os: string;
  os_version: string;
  hostname: string;
  python: string;
  battery_percent?: number;
  battery_charging?: boolean;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  pressure: number;
  location: string;
  description: string;
}

export interface TerminalExecuteData {
  command: string;
  output: string;
  success: boolean;
  duration_ms: number;
}

export interface WebSearchLiveResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchLiveData {
  query: string;
  results: WebSearchLiveResult[];
}

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number | string;
  modified: string;
}

export interface ListFilesData {
  path: string;
  items: FileItem[];
}

export interface RunCodeData {
  code: string;
  language: string;
  output: string;
  success: boolean;
}

export interface RememberFactData {
  key: string;
  value: string;
}

export interface RecallFactsData {
  key: string;
  value: string;
}

export interface SetReminderData {
  title: string;
  time: string;
}

export interface GetNetworkInfoData {
  ip: string;
  city: string;
  country: string;
  isp: string;
}

export interface ScreenshotData {
  filename: string;
}

export interface OpenAppData {
  name: string;
}

export interface CloseWindowData {
  name: string;
}
