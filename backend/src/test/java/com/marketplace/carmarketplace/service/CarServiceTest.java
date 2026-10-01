package com.marketplace.carmarketplace.service;

import com.marketplace.carmarketplace.dto.CarCreateRequest;
import com.marketplace.carmarketplace.dto.CarResponse;
import com.marketplace.carmarketplace.exception.CarNotFoundException;
import com.marketplace.carmarketplace.model.Car;
import com.marketplace.carmarketplace.model.FuelType;
import com.marketplace.carmarketplace.repository.CarRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {

    @Mock
    private CarRepository carRepository;

    @InjectMocks
    private CarService carService;

    @Test
    @DisplayName("findCars should normalize empty string to null and return mapped DTOs")
    void findCars_shouldReturnListOfCarResponses() {
        Car car = Car.builder()
                .id(UUID.randomUUID())
                .make("Tesla")
                .model("Model Y")
                .year(2023)
                .mileage(10000)
                .price(new BigDecimal("48000.00"))
                .fuelType(FuelType.ELECTRIC)
                .imageUrl("https://example.com/modely.jpg")
                .build();

        when(carRepository.findFiltered(null, new BigDecimal("50000.00"), 2022))
                .thenReturn(List.of(car));

        List<CarResponse> result = carService.findCars("   ", new BigDecimal("50000.00"), 2022);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().make()).isEqualTo("Tesla");
        verify(carRepository).findFiltered(null, new BigDecimal("50000.00"), 2022);
    }

    @Test
    @DisplayName("findCarById should return car when found")
    void findCarById_whenFound_shouldReturnCarResponse() {
        UUID carId = UUID.randomUUID();
        Car car = Car.builder()
                .id(carId)
                .make("BMW")
                .model("M3")
                .year(2022)
                .mileage(20000)
                .price(new BigDecimal("65000.00"))
                .fuelType(FuelType.PETROL)
                .imageUrl("https://example.com/m3.jpg")
                .build();

        when(carRepository.findById(carId)).thenReturn(Optional.of(car));

        CarResponse result = carService.findCarById(carId);

        assertThat(result.id()).isEqualTo(carId);
        assertThat(result.make()).isEqualTo("BMW");
        assertThat(result.model()).isEqualTo("M3");
    }

    @Test
    @DisplayName("findCarById should throw CarNotFoundException when not found")
    void findCarById_whenNotFound_shouldThrowCarNotFoundException() {
        UUID carId = UUID.randomUUID();
        when(carRepository.findById(carId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carService.findCarById(carId))
                .isInstanceOf(CarNotFoundException.class)
                .hasMessageContaining(carId.toString());
    }

    @Test
    @DisplayName("createCar should persist entity and return DTO")
    void createCar_shouldSaveAndReturnResponse() {
        UUID generatedId = UUID.randomUUID();
        CarCreateRequest request = new CarCreateRequest(
                " Toyota ",
                " Corolla Hybrid ",
                2023,
                12000,
                new BigDecimal("24000.00"),
                FuelType.HYBRID,
                " https://example.com/corolla.jpg "
        );

        Car savedCar = Car.builder()
                .id(generatedId)
                .make("Toyota")
                .model("Corolla Hybrid")
                .year(2023)
                .mileage(12000)
                .price(new BigDecimal("24000.00"))
                .fuelType(FuelType.HYBRID)
                .imageUrl("https://example.com/corolla.jpg")
                .build();

        when(carRepository.save(any(Car.class))).thenReturn(savedCar);

        CarResponse response = carService.createCar(request);

        assertThat(response.id()).isEqualTo(generatedId);
        assertThat(response.make()).isEqualTo("Toyota");
        assertThat(response.model()).isEqualTo("Corolla Hybrid");
        assertThat(response.price()).isEqualByComparingTo(new BigDecimal("24000.00"));
        verify(carRepository).save(any(Car.class));
    }
}
