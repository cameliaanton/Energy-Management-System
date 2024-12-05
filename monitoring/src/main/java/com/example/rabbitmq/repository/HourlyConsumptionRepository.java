package com.example.rabbitmq.repository;

import com.example.rabbitmq.models.HourlyConsumption;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface HourlyConsumptionRepository extends  JpaRepository<HourlyConsumption,Long>{

    @Query("SELECT hc FROM HourlyConsumption hc WHERE hc.deviceId = :deviceId AND hc.date >= :startOfDay AND hc.date <= :endOfDay")
    List<HourlyConsumption> findByDeviceIdAndDay(
            @Param("deviceId") Long deviceId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );
}
