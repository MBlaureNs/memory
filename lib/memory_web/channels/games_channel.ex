# adapted from nat's hangman2 repo
# https://github.com/NatTuck/hangman2

defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel

  alias Memory.Game
  
  def join("games:"<>name, payload, socket) do
    if authorized?(payload) do
      game = Memory.GameBackup.load(name) || Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      Memory.GameBackup.save(name, game)
      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("click", %{"x" => x, "y" => y}, socket) do
    game = Game.click(Memory.GameBackup.load(socket.assigns[:name]), x+y*4)
    Memory.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    MemoryWeb.Endpoint.broadcast(socket.topic, "update", %{"game" => Game.client_view(game)})
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end

  def handle_in("restart", payload, socket) do
    game = Game.restart(Memory.GameBackup.load(socket.assigns[:name]))
    Memory.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    MemoryWeb.Endpoint.broadcast(socket.topic, "update", %{"game" => Game.client_view(game)})
    {:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
  end
  
  def handle_info(:unlock, socket) do
    game = Game.unlock(Memory.GameBackup.load(socket.assigns[:name]))
    Memory.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    MemoryWeb.Endpoint.broadcast(socket.topic, "update", %{"game" => Game.client_view(game)})
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
