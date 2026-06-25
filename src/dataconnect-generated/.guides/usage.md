# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createBranch, updateBranch, assignBranchAdmin, assignPrincipal, createClass, activateClass, deactivateClass, seedAcademicClass, createWing, createSection } from '@dataconnect/generated';


// Operation CreateBranch:  For variables, look at type CreateBranchVars in ../index.d.ts
const { data } = await CreateBranch(dataConnect, createBranchVars);

// Operation UpdateBranch:  For variables, look at type UpdateBranchVars in ../index.d.ts
const { data } = await UpdateBranch(dataConnect, updateBranchVars);

// Operation AssignBranchAdmin:  For variables, look at type AssignBranchAdminVars in ../index.d.ts
const { data } = await AssignBranchAdmin(dataConnect, assignBranchAdminVars);

// Operation AssignPrincipal:  For variables, look at type AssignPrincipalVars in ../index.d.ts
const { data } = await AssignPrincipal(dataConnect, assignPrincipalVars);

// Operation CreateClass:  For variables, look at type CreateClassVars in ../index.d.ts
const { data } = await CreateClass(dataConnect, createClassVars);

// Operation ActivateClass:  For variables, look at type ActivateClassVars in ../index.d.ts
const { data } = await ActivateClass(dataConnect, activateClassVars);

// Operation DeactivateClass:  For variables, look at type DeactivateClassVars in ../index.d.ts
const { data } = await DeactivateClass(dataConnect, deactivateClassVars);

// Operation SeedAcademicClass:  For variables, look at type SeedAcademicClassVars in ../index.d.ts
const { data } = await SeedAcademicClass(dataConnect, seedAcademicClassVars);

// Operation CreateWing:  For variables, look at type CreateWingVars in ../index.d.ts
const { data } = await CreateWing(dataConnect, createWingVars);

// Operation CreateSection:  For variables, look at type CreateSectionVars in ../index.d.ts
const { data } = await CreateSection(dataConnect, createSectionVars);


```