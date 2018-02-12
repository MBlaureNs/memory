defmodule Memory.Game do
  def new() do
    %{
      board: makeboard(),
      clicks: 0,
      active: [],
      lock: false,
      win: false
    }
  end

  def client_view(game) do
    %{
      board: game.board |> Enum.map(&hide_tile/1),
      clicks: game.clicks,
      active: game.active,
      lock: game.lock,
      win: game.win
    }
  end

  defp hide_tile(tile) do
    case tile.state do
      :hidden -> Map.put(tile, :letter, "?")
      _ -> tile
    end
  end
  
  defp make_tile({letter, index}) do
    %{
      letter: letter,
      state: :hidden,
      x: rem(index, 4),
      y: div(index, 4)
    }
  end
  
  defp makeboard do
    "aabbccddeeffgghh"
    |> String.codepoints
    |> Enum.shuffle
    |> Enum.with_index
    |> Enum.map(&make_tile/1)
  end

  def click(game, i) do
    target = game.board |> Enum.at(i)

    if target.state != :hidden or game.lock do
      game
    end

    if length(game.active) >= 1 do
      Process.send_after(self(), :unlock, 1000)
    end
    
    %{
      board: game.board
      |> List.replace_at(i, target |> Map.put(:state, :active)),
      clicks: game.clicks + 1,
      active: [ i | game.active ],
      lock: length(game.active) >= 1,
      win: game.win
    }
  end

  def restart(game) do
    new()
  end

  def unlock(game) do
    i = game.active |> Enum.at(0)
    j = game.active |> Enum.at(1)
    a = game.board |> Enum.at(i)
    b = game.board |> Enum.at(j)
    
    if a.letter == b.letter do
      %{
	board: game.board
	|> List.replace_at(i, a |> Map.put(:state, :complete))
	|> List.replace_at(j, b |> Map.put(:state, :complete)),
	clicks: game.clicks,
	active: [],
	lock: false,
	win: game.board
	|> Enum.filter(fn(x) -> x.state == :complete end)
	|> length == 14
      }
    else
      %{
	board: game.board
	|> List.replace_at(i, a |> Map.put(:state, :hidden))
	|> List.replace_at(j, b |> Map.put(:state, :hidden)),
	clicks: game.clicks,
	active: [],
	lock: false,
	win: game.win
      }
    end
  end
  
  def main do
    IO.inspect(new())
  end
end
