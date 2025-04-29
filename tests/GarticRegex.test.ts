import { test, expect } from "bun:test";
import { searchGarticAnswer } from "../src/Core/functions";

test("Gartic Regex", async () => {
    const result1 = await searchGarticAnswer("​\n:point_right: C \\_ \\_ ​ ​\\_ \\_ \\_ ​ ​\\_ \\_ \\_ \\_ \n​");
    const result2 = await searchGarticAnswer("c _ _  _ _ _  _ _ _ _");
    const result3 = await searchGarticAnswer("J _ _-_ _ _ _ _");
    const result4 = await searchGarticAnswer("​\n:point_right: J \\_ \\_ -\\_ \\_ \\_ \\_ \\_ \n​");

    expect(result1.results).toContain("cap and gown");
    expect(result2.results).toContain("cap and gown");
    expect(result3.results).toContain("jiu-jitsu");
    expect(result4.results).toContain("jiu-jitsu");
});