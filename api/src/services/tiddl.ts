import { Express, Request, Response } from "express";
import { downloadUrl } from "@tiddljs/downloadUrl";
import { login, logout } from "@tiddljs/auth";
import { logs } from "../helpers/jobs";
import { ProcessingItemType } from "../types";

export async function tidalDL(id: number, app: Express, onFinish?: () => void) {
  const item: ProcessingItemType =
    app.settings.processingList.actions.getItem(id);

  item["output"] = logs(item, `=== Tiddl ===`);

  try {
    await downloadUrl(item.url, (progress: any) => {
      item["output"] = logs(item, progress.message);
      app.settings.processingList.actions.updateItem(item);
    });
    item["status"] = "downloaded";
  } catch (error: any) {
    item["output"] = logs(item, `Tiddl Error: ${error.message}`);
    item["status"] = "error";
  }

  item["loading"] = false;
  app.settings.processingList.actions.updateItem(item);
  if (onFinish) onFinish();
}

export async function tidalToken(req: Request, res: Response) {
  try {
    const { verificationUriComplete, loginPromise } = await login();
    res.write(`data: Please visit ${verificationUriComplete} to login\n\n`);
    await loginPromise;
    res.write(`data: Authenticated!\n\n`);
    res.end();
  } catch (error: any) {
    res.write(`data: ${error.message}\n\n`);
    res.end();
  }
}

export function deleteTiddlConfig() {
  logout();
}