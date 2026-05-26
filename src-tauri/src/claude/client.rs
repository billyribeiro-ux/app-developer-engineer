use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeRequestBody {
    pub model: String,
    pub max_tokens: u32,
    pub system: String,
    pub messages: Vec<MessageBody>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageBody {
    pub role: String,
    pub content: String,
}

pub const ANTHROPIC_API_URL: &str = "https://api.anthropic.com/v1/messages";
pub const ANTHROPIC_VERSION: &str = "2023-06-01";
