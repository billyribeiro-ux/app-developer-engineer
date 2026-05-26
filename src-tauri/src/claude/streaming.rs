use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct SseEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub delta: Option<DeltaContent>,
}

#[derive(Debug, Deserialize)]
pub struct DeltaContent {
    pub text: Option<String>,
}

pub fn parse_sse_line(line: &str) -> Option<SseEvent> {
    if !line.starts_with("data: ") {
        return None;
    }
    let data = &line[6..];
    if data == "[DONE]" {
        return None;
    }
    serde_json::from_str(data).ok()
}
