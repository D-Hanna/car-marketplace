package com.marketplace.carmarketplace.controller;

import com.marketplace.carmarketplace.dto.CarCreateRequest;
import com.marketplace.carmarketplace.dto.CarResponse;
import com.marketplace.carmarketplace.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cars")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @GetMapping
    public ResponseEntity<List<CarResponse>> listCars(
            @RequestParam(required = false) String make,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minYear
    ) {
        List<CarResponse> cars = carService.findCars(make, maxPrice, minYear);
        return ResponseEntity.ok(cars);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarResponse> getCarById(@PathVariable UUID id) {
        CarResponse car = carService.findCarById(id);
        return ResponseEntity.ok(car);
    }

    @PostMapping
    public ResponseEntity<CarResponse> createCar(@Valid @RequestBody CarCreateRequest request) {
        CarResponse createdCar = carService.createCar(request);
        URI location = URI.create("/api/v1/cars/" + createdCar.id());
        return ResponseEntity.created(location).body(createdCar);
    }
}
