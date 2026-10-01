package com.marketplace.carmarketplace.dto;

import com.marketplace.carmarketplace.model.FuelType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CarCreateRequest(
    @NotBlank(message = "Make is required and cannot be blank")
    @Size(max = 50, message = "Make must not exceed 50 characters")
    String make,

    @NotBlank(message = "Model is required and cannot be blank")
    @Size(max = 50, message = "Model must not exceed 50 characters")
    String model,

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be at least 1900")
    @Max(value = 2030, message = "Year cannot exceed 2030")
    Integer year,

    @NotNull(message = "Mileage is required")
    @Min(value = 0, message = "Mileage must be non-negative")
    Integer mileage,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
    BigDecimal price,

    @NotNull(message = "Fuel type is required")
    FuelType fuelType,

    @NotBlank(message = "Image URL is required and cannot be blank")
    String imageUrl
) {}
