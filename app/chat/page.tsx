if (data.error) {
  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content:
        "⚠️ Fout bij API:\n\n" +
        (typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error, null, 2)),
      model: "error",
    },
  ]);
}
