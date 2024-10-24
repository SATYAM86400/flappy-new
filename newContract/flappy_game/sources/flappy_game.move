module 0x4d5a446b5ba7f8f7eb529791a4c325d71b5f28c53a2418f18f18cd1200dadceb::flappy_game {
    use std::signer;
    use std::string::{String, utf8};
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::error; // Import the error module

    // Error codes
    const EGAME_STATE_EXISTS: u64 = 1;
    const EGAME_STATE_NOT_FOUND: u64 = 2;
    const ENOT_AUTHORIZED: u64 = 3;
    const EMODULE_ALREADY_INITIALIZED: u64 = 4;
    const EINVALID_INPUT: u64 = 5;

    // Admin resource to manage privileged operations
    struct AdminData has key {
        admin_address: address,
    }

    // Game state resource associated with each player
    struct GameState has key {
        owner: address,
        score: u64,
        status: String,
    }

    /// Initialize the module and set the admin address
    public entry fun initialize_module(admin: &signer) {
        let admin_address = signer::address_of(admin);
        
        // Ensure AdminData doesn't already exist in the admin's account
        assert!(
            !exists<AdminData>(admin_address),
            error::permission_denied(EMODULE_ALREADY_INITIALIZED)
        );
        
        // Move AdminData to the admin's account
        move_to(admin, AdminData { admin_address });
    }

    /// Create a new game for the player
    public entry fun create_game(player: &signer) {
        let player_address = signer::address_of(player);
        
        // Ensure GameState doesn't already exist for the player
        assert!(
            !exists<GameState>(player_address),
            error::already_exists(EGAME_STATE_EXISTS)
        );
        
        let game_state = GameState {
            owner: player_address,
            score: 0,
            status: utf8(b"New Game Created. Play to start scoring!"),
        };
        
        // Move GameState to the player's account
        move_to(player, game_state);
    }

    /// Reset the existing game state for the player
    public entry fun reset_game(player: &signer) acquires GameState {
        let player_address = signer::address_of(player);
        
        // Ensure GameState exists for the player
        assert!(
            exists<GameState>(player_address),
            error::not_found(EGAME_STATE_NOT_FOUND)
        );

        let game_state = borrow_global_mut<GameState>(player_address);
        
        // Ensure the signer is the owner of the GameState
        assert!(
            game_state.owner == player_address,
            error::permission_denied(ENOT_AUTHORIZED)
        );

        // Reset game state
        game_state.score = 0;
        game_state.status = utf8(b"Game reset. Play to start scoring!");
    }

    /// Submit a score for the current game
    public entry fun submit_score(player: &signer, score: u64) acquires GameState {
        let player_address = signer::address_of(player);
        
        // Ensure the player has an existing game state
        assert!(
            exists<GameState>(player_address),
            error::not_found(EGAME_STATE_NOT_FOUND)
        );

        let game_state = borrow_global_mut<GameState>(player_address);
        
        // Ensure the signer is the owner of the GameState
        assert!(
            game_state.owner == player_address,
            error::permission_denied(ENOT_AUTHORIZED)
        );

        // Update the score
        game_state.score = score;
        game_state.status = utf8(b"Score submitted successfully!");
    }

    /// Reward the player with tokens (only admin can call this)
    public entry fun reward_player(
        admin: &signer,
        player_address: address,
        amount: u64
    ) acquires AdminData {
        let admin_address = signer::address_of(admin);
        
        // Borrow AdminData from the admin's account
        let admin_data = borrow_global<AdminData>(admin_address);

        // Verify that the signer is the admin
        assert!(
            admin_address == admin_data.admin_address,
            error::permission_denied(ENOT_AUTHORIZED)
        );

        // Transfer tokens to the player
        coin::transfer<AptosCoin>(admin, player_address, amount);
    }

    /// Allow admin to withdraw collected funds
    public entry fun withdraw_funds(
        admin: &signer,
        receiver_address: address,
        amount: u64
    ) acquires AdminData {
        let admin_address = signer::address_of(admin);
        
        // Borrow AdminData from the admin's account
        let admin_data = borrow_global<AdminData>(admin_address);

        // Verify that the signer is the admin
        assert!(
            admin_address == admin_data.admin_address,
            error::permission_denied(ENOT_AUTHORIZED)
        );

        // Transfer tokens to the receiver
        coin::transfer<AptosCoin>(admin, receiver_address, amount);
    }

    // Get the game state of a player view function
    #[view]
    public fun get_game_state(player_address: address): (u64, String) acquires GameState {
        // Ensure the player has an existing game state
        assert!(
            exists<GameState>(player_address),
            error::not_found(EGAME_STATE_NOT_FOUND)
        );
        
        let game_state = borrow_global<GameState>(player_address);
        (game_state.score, game_state.status)
    }

    /// Update the admin address (only current admin can call this)
    public entry fun update_admin_address(
        admin: &signer,
        new_admin_address: address
    ) acquires AdminData {
        let admin_address = signer::address_of(admin);
        
        // Borrow AdminData from the admin's account
        let admin_data = borrow_global_mut<AdminData>(admin_address);

        // Verify that the signer is the current admin
        assert!(
            admin_address == admin_data.admin_address,
            error::permission_denied(ENOT_AUTHORIZED)
        );

        // Update the admin_address field
        admin_data.admin_address = new_admin_address;
    }
}
