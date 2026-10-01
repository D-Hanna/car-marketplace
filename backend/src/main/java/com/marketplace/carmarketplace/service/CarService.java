package com.marketplace.carmarketplace.service;

import com.marketplace.carmarketplace.dto.CarCreateRequest;
import com.marketplace.carmarketplace.dto.CarResponse;
import com.marketplace.carmarketplace.exception.CarNotFoundException;
import com.marketplace.carmarketplace.model.Car;
import com.marketplace.carmarketplace.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarService {

    private final CarRepository carRepository;

    @Transactional(readOnly = true)
    public List<CarResponse> findCars(String make, BigDecimal maxPrice, Integer minYear) {
        log.debug("Finding cars with make='{}', maxPrice={}, minYear={}", make, maxPrice, minYear);
        String normalizedMake = (make != null && !make.trim().isEmpty()) ? make.trim() : null;
        return carRepository.findFiltered(normalizedMake, maxPrice, minYear)
                .stream()
                .map(CarResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CarResponse findCarById(UUID id) {
        log.debug("Finding car by id={}", id);
        return carRepository.findById(id)
                .map(CarResponse::fromEntity)
                .orElseThrow(() -> new CarNotFoundException(id));
    }

    @Transactional
    public CarResponse createCar(CarCreateRequest request) {
        log.info("Creating car: {} {}", request.make(), request.model());
        Car car = Car.builder()
                .make(request.make().trim())
                .model(request.model().trim())
                .year(request.year())
                .mileage(request.mileage())
                .price(request.price())
                .fuelType(request.fuelType())
                .imageUrl(request.imageUrl().trim())
                .build();

        Car savedCar = carRepository.save(car);
        log.info("Car created successfully with id={}", savedCar.getId());
        return CarResponse.fromEntity(savedCar);
    }
}
