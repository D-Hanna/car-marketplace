package com.marketplace.carmarketplace.config;

import com.marketplace.carmarketplace.model.Car;
import com.marketplace.carmarketplace.model.FuelType;
import com.marketplace.carmarketplace.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CarRepository carRepository;

    @Override
    public void run(String... args) {
        if (carRepository.count() > 0) {
            log.info("Car repository already contains data. Skipping initial seed.");
            return;
        }

        log.info("Seeding realistic sample car listings...");

        List<Car> initialCars = List.of(
                Car.builder()
                        .make("Tesla")
                        .model("Model 3 Long Range")
                        .year(2023)
                        .mileage(14500)
                        .price(new BigDecimal("38990.00"))
                        .fuelType(FuelType.ELECTRIC)
                        .imageUrl("https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80")
                        .build(),
                Car.builder()
                        .make("BMW")
                        .model("330e M Sport")
                        .year(2022)
                        .mileage(28000)
                        .price(new BigDecimal("34500.00"))
                        .fuelType(FuelType.PLUGIN_HYBRID)
                        .imageUrl("https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80")
                        .build(),
                Car.builder()
                        .make("Audi")
                        .model("Q5 S Line")
                        .year(2021)
                        .mileage(42000)
                        .price(new BigDecimal("39900.00"))
                        .fuelType(FuelType.DIESEL)
                        .imageUrl("https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80")
                        .build(),
                Car.builder()
                        .make("Toyota")
                        .model("RAV4 Hybrid Limited")
                        .year(2023)
                        .mileage(9200)
                        .price(new BigDecimal("36200.00"))
                        .fuelType(FuelType.HYBRID)
                        .imageUrl("https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80")
                        .build(),
                Car.builder()
                        .make("Porsche")
                        .model("Taycan 4S")
                        .year(2022)
                        .mileage(18500)
                        .price(new BigDecimal("88500.00"))
                        .fuelType(FuelType.ELECTRIC)
                        .imageUrl("https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80")
                        .build(),
                Car.builder()
                        .make("Mercedes-Benz")
                        .model("EQE 350+ AMG Line")
                        .year(2023)
                        .mileage(11000)
                        .price(new BigDecimal("62000.00"))
                        .fuelType(FuelType.ELECTRIC)
                        .imageUrl("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80")
                        .build(),
                Car.builder()
                        .make("Ford")
                        .model("Mustang GT Fastback")
                        .year(2020)
                        .mileage(36000)
                        .price(new BigDecimal("41500.00"))
                        .fuelType(FuelType.PETROL)
                        .imageUrl("https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80")
                        .build(),
                Car.builder()
                        .make("Volkswagen")
                        .model("Golf GTI Performance")
                        .year(2021)
                        .mileage(31000)
                        .price(new BigDecimal("29500.00"))
                        .fuelType(FuelType.PETROL)
                        .imageUrl("https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80")
                        .build()
        );

        carRepository.saveAll(initialCars);
        log.info("Successfully seeded {} cars into the database.", initialCars.size());
    }
}
