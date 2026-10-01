package com.marketplace.carmarketplace.repository;

import com.marketplace.carmarketplace.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CarRepository extends JpaRepository<Car, UUID>, JpaSpecificationExecutor<Car> {

    @Query("""
        SELECT c FROM Car c
        WHERE (:make IS NULL OR LOWER(c.make) LIKE LOWER(CONCAT('%', :make, '%')))
          AND (:maxPrice IS NULL OR c.price <= :maxPrice)
          AND (:minYear IS NULL OR c.year >= :minYear)
        ORDER BY c.year DESC, c.price ASC
    """)
    List<Car> findFiltered(
        @Param("make") String make,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minYear") Integer minYear
    );
}
