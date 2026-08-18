"""Minimal MCP test server, exercising cline-for-web's MCP "test connection"
button across all three transports it supports.

Usage:
    python server.py stdio                       # spawned by cline-for-web itself
    python server.py sse --port 8765              # then point cline-for-web at http://127.0.0.1:8765/sse
    python server.py streamable-http --port 8766   # then point cline-for-web at http://127.0.0.1:8766/mcp
"""
import sys

from mcp.server.mcpserver import MCPServer

mcp = MCPServer("test-mcp-server", version="1.0.0")


@mcp.tool()
def ping() -> str:
    """Returns pong."""
    return "pong"


@mcp.tool()
def echo(text: str) -> str:
    """Echoes the given text back."""
    return text


if __name__ == "__main__":
    transport = sys.argv[1] if len(sys.argv) > 1 else "stdio"
    port = 8765
    if "--port" in sys.argv:
        port = int(sys.argv[sys.argv.index("--port") + 1])
    if transport == "stdio":
        mcp.run(transport="stdio")
    else:
        mcp.run(transport=transport, port=port)
