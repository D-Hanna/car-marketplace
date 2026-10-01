package com.marketplace.carmarketplace.dto;

import com.marketplace.carmarketplace.model.Car;
import com.marketplace.carmarketplace.model.FuelType;

import java.math.BigDecimal;
import java.util.UUID;

public record CarResponse(
    UUID id,
    String make,
    String model,
    Integer year,
    Integer mileage,
    BigDecimal price,
    FuelType fuelType,
    String imageUrl
) {
    public static CarResponse fromEntity(Car car) {
        return new CarResponse(
            car.getId(),
            car.getMake(),
            car.getModel(),
            car.getYear(),
            car.getMileage(),
            car.getPrice(),
            car.getFuelType(),
            car.getImageUrl()
        );
    }
}
