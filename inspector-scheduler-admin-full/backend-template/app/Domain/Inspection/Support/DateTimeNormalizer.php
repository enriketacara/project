<?php

namespace App\Domain\Inspection\Support;

use Carbon\CarbonImmutable;

final class DateTimeNormalizer
{
    /**
     * Convert inspector local datetime string to UTC CarbonImmutable.
     * Expects: "Y-m-d H:i:s" or any Carbon-parseable string.
     */
    public static function localToUtc(string $localDateTime, string $inspectorTimezone): CarbonImmutable
    {
        return CarbonImmutable::parse($localDateTime, $inspectorTimezone)->utc();
    }

    public static function utcToLocal(?string $utcDateTime, string $inspectorTimezone): ?string
    {
        if (!$utcDateTime) return null;
        return CarbonImmutable::parse($utcDateTime, 'UTC')->setTimezone($inspectorTimezone)->format('Y-m-d\TH:i:s');
    }
}
