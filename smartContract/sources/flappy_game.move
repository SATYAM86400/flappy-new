module 0xe7d3a8337a3bf682022da10fdfca180727436c7787b11d1166a1e78d050bdf38::flappy_game {
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::signer;
    use std::string::{String, utf8}; // Importing string utilities

    // Define the game state with necessary abilities
    struct GameState has key, store {
        score: u64,
        status: String,
    }

    /// Create a new game or reset an existing one for the player
    public entry fun create_game(player: &signer) acquires GameState {
        let player_address = signer::address_of(player);
        if (exists<GameState>(player_address)) {
            // If a game already exists, reset its state
            let game_state = borrow_global_mut<GameState>(player_address);
            game_state.score = 0;
            game_state.status = utf8(b"New Game Created. Play to start scoring!");
        } else {
            // Otherwise, initialize a new game state
            let game_state = GameState { 
                score: 0, 
                status: utf8(b"New Game Created. Play to start scoring!") 
            };
            move_to(player, game_state);
        }
    }

    /// Submit a score for the current game and reward the player
    public entry fun submit_score(player: &signer, score: u64) acquires GameState {
        let player_address = signer::address_of(player);

        // Ensure the player has an existing game state
        assert!(exists<GameState>(player_address), 0x1); // Error code if game state does not exist

        // Retrieve the GameState resource
        let game_state = borrow_global_mut<GameState>(player_address);
        game_state.score = score;
        game_state.status = utf8(b"Score submitted successfully!");

        // Optionally, reward the player with Aptos tokens
        let reward_amount: u64 = 100; // Example reward amount
        coin::transfer<AptosCoin>(player, player_address, reward_amount);
    }
}
