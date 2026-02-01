import { GoogleGenerativeAI } from "@google/generative-ai"
import { AIContext } from "@/types"

export class GeminiProvider {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generateReply(
    message: string,
    context: AIContext,
    model: string = "gemini-1.5-flash"
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context)

    const genModel = this.client.getGenerativeModel({ model })

    const result = await genModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `\n\nBuyer's message:\n${message}` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    })

    const response = result.response
    return response.text() || "Unable to generate reply."
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

    prompt += "\nGenerate a response to the buyer's message."

    return prompt
  }
}
