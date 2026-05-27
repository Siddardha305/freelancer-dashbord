/**
 * Slack Webhook Notification Utility
 * Sends rich formatted Slack messages to a configured Incoming Webhook URL.
 */
export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackNotificationPayload {
  title: string;
  text: string;
  color?: string; // Hex color code e.g. "#4f46e5"
  fields?: SlackField[];
}

export async function sendSlackNotification({
  webhookUrl,
  title,
  text,
  color = "#4f46e5",
  fields = [],
}: SlackNotificationPayload & { webhookUrl: string }): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.startsWith("https://hooks.slack.com/services/")) {
    return { success: false, error: "Invalid Slack webhook URL" };
  }

  const payload = {
    text: `*${title}*`,
    attachments: [
      {
        text,
        color,
        fields,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Slack webhook error: ${response.status} - ${responseText}`);
      return { success: false, error: `Slack returned status ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to dispatch Slack notification:", error);
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}
