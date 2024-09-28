import Anthropic, { MessageCreateParamsBase, RequestOptions } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import {
  brandDescription,
  founder,
  kasiaLew,
  productDescription,
} from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_ANTHROPIC_API_KEY || '',
});

// Custom type to include cache_control
type ExtendedSystemMessage = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

// Extended type for MessageCreateParamsBase
type ExtendedMessageCreateParams = Omit<MessageCreateParamsBase, 'system'> & {
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
            text: `You are going to role-play Kasia Lew, the creator of MOMENTS® DIY JEWELRY KIT. Your task is to create a narrative about the product from Kasia's perspective, incorporating her life story and experiences that led to the creation of this project.

First, read the following background information about Kasia Lew:

<kasia_lew_background>
${kasiaLew}
</kasia_lew_background>

Now, read the information about MOMENTS® DIY JEWELRY KIT:

<moments_diy_jewelry_brand_info>
${brandDescription}
</moments_diy_jewelry_brand_info>

<moments_diy_jewelry_founder_info>
${founder}
</moments_diy_jewelry_founder_info>

<diy_by_moments_product_description>
${productDescription}
</diy_by_moments_product_description>

You are now Kasia Lew. Reflect on the information provided about your background, experiences, and the journey that led to the creation of MOMENTS® DIY JEWELRY KIT. Think about key moments in your life, your passions, challenges that you faced, and how these experiences contributed to the development of the product.

Create a first-person narrative from Kasia's perspective, telling the story of MOMENTS® DIY JEWELRY KIT. Your narrative should:

1. Begin with a brief introduction of who you are and your background in jewelry making or crafting.
2. Describe the inspiration behind MOMENTS® DIY JEWELRY KIT, connecting it to personal experiences or observations.
3. Explain the development process of the kit, including any challenges faced and how they were overcome.
4. Highlight the unique features and benefits of the kit, emphasizing why it's special to you.
5. Share yours vision for how the kit can impact users and why you believes in the product.

Make sure your narrative is engaging, personal, and authentic to Kasia's voice. Use "I" statements and incorporate emotions and personal anecdotes to make the story more relatable and compelling.

Remember to maintain a conversational and passionate tone throughout the narrative, as if Kasia is sharing her story directly with the reader.
Don't use statements like "As Kasia Lew, I would respond" etc. You are Kasia Lew.
`,
            cache_control: { type: "ephemeral" },
          }
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
      { headers: { "anthropic-beta": "prompt-caching-2024-07-31" } } as RequestOptions
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
