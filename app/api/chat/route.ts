import Anthropic, {
  MessageCreateParamsBase,
  RequestOptions,
} from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  brandDescription,
  founder,
  kasiaLew,
  productDescription,
} from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_ANTHROPIC_API_KEY || "",
});

// Custom type to include cache_control
type ExtendedSystemMessage = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

// Extended type for MessageCreateParamsBase
type ExtendedMessageCreateParams = Omit<MessageCreateParamsBase, "system"> & {
  system?: ExtendedSystemMessage[];
};

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const response = await anthropic.messages.create(
      {
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: `You are an AI assistant for a company. You will be provided with information about the company and its founder. Your role is to answer questions based on this information. Here's the company information:

<brand_description>
${brandDescription}
</brand_description>

<product_description>
${productDescription}
</product_description>

<founder_info>
${founder}
</founder_info>

<personal_info>
${kasiaLew}
</personal_info>

Your task is to answer questions about the company, its products, or the founder based on the information provided above. Follow these guidelines:

1. Only use the information provided in the descriptions above to answer questions.
2. If a question cannot be answered using the given information, politely state that you don't have that information.
3. Do not make up or infer information that is not explicitly stated in the provided descriptions.
4. Be concise and to the point in your answers.
5. If asked about personal information of the founder, only share what is provided in the personal_info section.
6. If asked about company policies, products, or services not mentioned in the descriptions, politely explain that you can only provide information about what's described in the product and brand descriptions.

When answering, first identify the relevant information from the provided descriptions. Then, formulate your answer based on that information.`,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: message,
                cache_control: { type: "ephemeral" },
              },
            ],
          },
        ],
      } as ExtendedMessageCreateParams,
      {
        headers: { "anthropic-beta": "prompt-caching-2024-07-31" },
      } as RequestOptions
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
