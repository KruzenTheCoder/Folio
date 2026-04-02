import { POST as exportResume } from "@/app/api/resume/export/route";

export async function POST(req: Request) {
  return exportResume(req);
}
