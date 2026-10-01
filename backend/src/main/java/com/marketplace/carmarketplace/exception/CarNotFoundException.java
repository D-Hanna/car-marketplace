package com.marketplace.carmarketplace.exception;

import java.util.UUID;

public class CarNotFoundException extends RuntimeException {

    public CarNotFoundException(UUID id) {
        super("Car not found with ID: " + id);
    }

    public CarNotFoundException(String message) {
        super(message);
    }
}
