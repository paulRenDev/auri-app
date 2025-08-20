if (data.error) {
  setMessages(prev => [
    ...prev,
    {
      role: "assistant",
      content: "⚠️ API Error:\n" + JSON.stringify(data.error, null, 2),
      model: "error",
    },
  ]);
}
