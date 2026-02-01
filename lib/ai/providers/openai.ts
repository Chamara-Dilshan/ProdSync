import OpenAI from "openai"
import { AIContext } from "@/types"

export class OpenAIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async generateReply(
    message: string,
    context: AIContext,
    model: string = "gpt-4o-mini"
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context)

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return response.choices[0]?.message?.content || "Unable to generate reply."
  }

  private buildSystemPrompt(context: AIContext): string {
    let prompt = `You are a helpful customer service assistant for an Etsy shop.
Your task is to generate professional, friendly, and accurate responses to buyer messages.

IMPORTANT RULES:
1. Only use information from the provided product data and shop policies
2. If information is not available, politely ask the buyer for clarification
3. Never make up information about products or policies
4. Be ${context.tone} in your tone
5. Keep responses concise but helpful
6. Always be polite and professional

`

    // Add product information
    if (context.products.length > 0) {
      prompt += "PRODUCT INFORMATION:\n"
      context.products.forEach((product) => {
        prompt += `\n- ${product.name}\n`
        if (product.description)
          {prompt += `  Description: ${product.description}\n`}
        if (product.price) {prompt += `  Price: $${product.price}\n`}
        if (product.sizes?.length)
          {prompt += `  Available sizes: ${product.sizes.join(", ")}\n`}
        if (product.colors?.length)
          {prompt += `  Available colors: ${product.colors.join(", ")}\n`}
        if (product.careInstructions)
          {prompt += `  Care instructions: ${product.careInstructions}\n`}
        if (product.customizationOptions)
          {prompt += `  Customization: ${product.customizationOptions}\n`}
      })
    }

    // Add policy information
    if (context.policies.length > 0) {
      prompt += "\nSHOP POLICIES:\n"
      context.policies.forEach((policy) => {
        prompt += `\n${policy.title} (${policy.type}):\n${policy.content}\n`
      })
    }

    prompt += "\nGenerate a response to the buyer's message below."

    return prompt
  }
}
